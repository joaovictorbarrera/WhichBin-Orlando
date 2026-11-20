pipeline {
    agent {
        label 'whichbin-deploy'
    }

    triggers {
        pollSCM('* * * * *')
    }

    options {
        disableConcurrentBuilds()
        timeout(time: 10, unit: 'MINUTES')
    }

    stages {
        stage('Checkout and version') {
            steps {
                checkout scm
                powershell '''
                    $PSNativeCommandUseErrorActionPreference = $false
                    if (Test-Path '.git/shallow') {
                        git fetch --unshallow --tags
                    } else {
                        git fetch --tags
                    }
                    if ($LASTEXITCODE -ne 0) {
                        throw 'Fetching Git history and tags failed.'
                    }
                '''
                script {
                    env.APP_VERSION = powershell(
                        script: 'node scripts/generate-version.mjs',
                        returnStdout: true
                    ).trim()
                    echo "Building version ${env.APP_VERSION}"
                }
            }
        }

        stage('Test') {
            steps {
                powershell '''
                    $PSNativeCommandUseErrorActionPreference = $false
                    $mysqlContainer = "whichbin-ci-mysql-$env:BUILD_NUMBER"

                    try {
                        docker run --detach --rm `
                            --name $mysqlContainer `
                            --env MYSQL_ROOT_PASSWORD=test-password `
                            --env MYSQL_DATABASE=whichbin_test `
                            --publish '127.0.0.1::3306' `
                            mysql:8.4
                        if ($LASTEXITCODE -ne 0) {
                            throw 'Could not start the temporary MySQL container.'
                        }

                        $portMapping = docker port $mysqlContainer '3306/tcp'
                        if ($LASTEXITCODE -ne 0 -or -not $portMapping) {
                            throw 'Could not determine the temporary MySQL port.'
                        }
                        $mysqlPort = ($portMapping | Select-Object -First 1) -replace '^.*:', ''

                        $mysqlReady = $false
                        for ($attempt = 0; $attempt -lt 60; $attempt++) {
                            docker exec --env MYSQL_PWD=test-password $mysqlContainer mysqladmin ping -h 127.0.0.1 -uroot --silent 2>$null | Out-Null
                            if ($LASTEXITCODE -eq 0) {
                                $mysqlReady = $true
                                break
                            }
                            Start-Sleep -Seconds 2
                        }

                        if (-not $mysqlReady) {
                            docker logs $mysqlContainer
                            throw 'Temporary MySQL did not become ready within 120 seconds.'
                        }

                        $env:SPRING_DATASOURCE_URL = "jdbc:mysql://127.0.0.1:$mysqlPort/whichbin_test?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC"
                        $env:SPRING_DATASOURCE_USERNAME = 'root'
                        $env:SPRING_DATASOURCE_PASSWORD = 'test-password'
                        Push-Location 'whichbin-api'
                        try {
                            & (Join-Path (Get-Location) 'mvnw.cmd') --batch-mode --no-transfer-progress "-Drevision=$env:APP_VERSION" test
                            if ($LASTEXITCODE -ne 0) {
                                throw 'Backend Maven tests failed.'
                            }
                        } finally {
                            Pop-Location
                        }
                    } finally {
                        docker rm --force $mysqlContainer 2>$null | Out-Null
                    }
                '''
            }
        }

        stage('Register GitHub deployment') {
            steps {
                withCredentials([
                    string(credentialsId: 'github-deployments-token', variable: 'GITHUB_TOKEN')
                ]) {
                    script {
                        env.GITHUB_DEPLOYMENT_ID = powershell(
                            script: '''
                                $PSNativeCommandUseErrorActionPreference = $false
                                $headers = @{
                                    Authorization = "Bearer $env:GITHUB_TOKEN"
                                    Accept = 'application/vnd.github+json'
                                    'X-GitHub-Api-Version' = '2022-11-28'
                                }
                                $payload = @{
                                    ref = $env:GIT_COMMIT
                                    environment = 'Production (Backend)'
                                    description = "Jenkins build $env:BUILD_NUMBER ($env:APP_VERSION)"
                                    auto_merge = $false
                                    required_contexts = @()
                                    production_environment = $true
                                } | ConvertTo-Json -Depth 5
                                $deployment = Invoke-RestMethod `
                                    -Uri 'https://api.github.com/repos/joaovictorbarrera/WhichBin-Orlando/deployments' `
                                    -Method Post `
                                    -Headers $headers `
                                    -ContentType 'application/json' `
                                    -Body $payload
                                if (-not $deployment.id) {
                                    throw 'GitHub did not return a deployment ID.'
                                }
                                Write-Output $deployment.id
                            ''',
                            returnStdout: true
                        ).trim()
                        if (-not env.GITHUB_DEPLOYMENT_ID) {
                            error('GitHub deployment registration returned an empty deployment ID.')
                        }
                        echo "Registered GitHub deployment ${env.GITHUB_DEPLOYMENT_ID}"
                        powershell '''
                            $PSNativeCommandUseErrorActionPreference = $false
                            $headers = @{
                                Authorization = "Bearer $env:GITHUB_TOKEN"
                                Accept = 'application/vnd.github+json'
                                'X-GitHub-Api-Version' = '2022-11-28'
                            }
                            $payload = @{
                                state = 'in_progress'
                                description = "Jenkins build $env:BUILD_NUMBER is deploying"
                                environment_url = 'https://api.whichbin-orlando.org/api/'
                                log_url = $env:BUILD_URL
                            } | ConvertTo-Json -Depth 5
                            $null = Invoke-RestMethod `
                                -Uri "https://api.github.com/repos/joaovictorbarrera/WhichBin-Orlando/deployments/$env:GITHUB_DEPLOYMENT_ID/statuses" `
                                -Method Post `
                                -Headers $headers `
                                -ContentType 'application/json' `
                                -Body $payload
                        '''
                    }
                }
            }
        }

        stage('Build and deploy') {
            steps {
                withCredentials([
                    file(credentialsId: 'whichbin-tls-pfx', variable: 'JENKINS_TLS_CERT_FILE'),
                    string(credentialsId: 'whichbin-db-username', variable: 'DB_USERNAME'),
                    string(credentialsId: 'whichbin-db-password', variable: 'DB_PASSWORD'),
                    string(credentialsId: 'whichbin-db-root-password', variable: 'DB_ROOT_PASSWORD'),
                    string(credentialsId: 'whichbin-tls-keystore-password', variable: 'TLS_KEYSTORE_PASSWORD'),
                    string(credentialsId: 'whichbin-client-url', variable: 'CLIENT_URL')
                ]) {
                    powershell '''
                        $PSNativeCommandUseErrorActionPreference = $false
                        $secretsDirectory = Join-Path $env:WORKSPACE 'secrets'
                        $certificatePath = Join-Path $secretsDirectory 'whichbin-orlando.org-fullchain.pfx'

                        New-Item -ItemType Directory -Path $secretsDirectory -Force | Out-Null
                        Copy-Item -LiteralPath $env:JENKINS_TLS_CERT_FILE -Destination $certificatePath -Force
                        if (-not (Test-Path -LiteralPath $certificatePath -PathType Leaf)) {
                            throw 'Could not stage the TLS certificate for Docker Compose.'
                        }

                        $env:TLS_CERT_FILE = $certificatePath
                        docker compose up -d --build --remove-orphans
                        if ($LASTEXITCODE -ne 0) {
                            throw 'Docker Compose deployment failed.'
                        }
                    '''
                }
            }
        }
    }

    post {
        always {
            script {
                env.BUILD_RESULT = currentBuild.currentResult
                if (currentBuild.currentResult == 'SUCCESS') {
                    env.GITHUB_DEPLOYMENT_STATE = 'success'
                } else if (currentBuild.currentResult == 'FAILURE') {
                    env.GITHUB_DEPLOYMENT_STATE = 'failure'
                } else {
                    env.GITHUB_DEPLOYMENT_STATE = 'error'
                }

                if (env.GITHUB_DEPLOYMENT_ID) {
                    try {
                        withCredentials([
                            string(credentialsId: 'github-deployments-token', variable: 'GITHUB_TOKEN')
                        ]) {
                            powershell '''
                                $PSNativeCommandUseErrorActionPreference = $false
                                $headers = @{
                                    Authorization = "Bearer $env:GITHUB_TOKEN"
                                    Accept = 'application/vnd.github+json'
                                    'X-GitHub-Api-Version' = '2022-11-28'
                                }
                                $payload = @{
                                    state = $env:GITHUB_DEPLOYMENT_STATE
                                    description = "Jenkins build finished with $env:BUILD_RESULT"
                                    environment_url = 'https://api.whichbin-orlando.org/api/'
                                    log_url = $env:BUILD_URL
                                } | ConvertTo-Json -Depth 5
                                $null = Invoke-RestMethod `
                                    -Uri "https://api.github.com/repos/joaovictorbarrera/WhichBin-Orlando/deployments/$env:GITHUB_DEPLOYMENT_ID/statuses" `
                                    -Method Post `
                                    -Headers $headers `
                                    -ContentType 'application/json' `
                                    -Body $payload
                            '''
                        }
                    } catch (Exception exception) {
                        echo "Could not update the GitHub deployment status: ${exception.message}"
                        if (currentBuild.currentResult == 'SUCCESS') {
                            currentBuild.result = 'UNSTABLE'
                        }
                    }
                }

            }
        }
    }
}
