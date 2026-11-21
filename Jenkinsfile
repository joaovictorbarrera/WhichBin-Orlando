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
                    def sourceBranch = (env.CHANGE_BRANCH ?: env.BRANCH_NAME ?: env.GIT_BRANCH ?: '').replaceFirst('^refs/heads/', '').replaceFirst('^refs/remotes/origin/', '').replaceFirst('^origin/', '')
                    if (sourceBranch == 'staging') {
                        env.DEPLOYMENT_ENVIRONMENT = 'staging'
                        env.DEPLOYMENT_URL = 'https://betaapi.whichbin-orlando.org/api/'
                    } else if (sourceBranch == 'main') {
                        env.DEPLOYMENT_ENVIRONMENT = 'production'
                        env.DEPLOYMENT_URL = 'https://api.whichbin-orlando.org/api/'
                    } else {
                        error("Refusing to deploy unsupported branch: ${sourceBranch}")
                    }
                    echo "Building version ${env.APP_VERSION}"
                    echo "Deploying ${env.DEPLOYMENT_ENVIRONMENT}"
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
                                    environment = "$env:DEPLOYMENT_ENVIRONMENT (Backend)"
                                    description = "Jenkins build $env:BUILD_NUMBER ($env:APP_VERSION)"
                                    auto_merge = $false
                                    required_contexts = @()
                                    production_environment = ($env:DEPLOYMENT_ENVIRONMENT -eq 'production')
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
                        if (!env.GITHUB_DEPLOYMENT_ID) {
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
                                environment_url = $env:DEPLOYMENT_URL
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
                    string(credentialsId: 'whichbin-tls-keystore-password', variable: 'JENKINS_TLS_KEYSTORE_PASSWORD'),
                    string(credentialsId: 'whichbin-db-username', variable: 'PRODUCTION_DB_USERNAME'),
                    string(credentialsId: 'whichbin-db-password', variable: 'PRODUCTION_DB_PASSWORD'),
                    string(credentialsId: 'whichbin-db-root-password', variable: 'PRODUCTION_DB_ROOT_PASSWORD'),
                    string(credentialsId: 'whichbin-staging-db-username', variable: 'STAGING_DB_USERNAME'),
                    string(credentialsId: 'whichbin-staging-db-password', variable: 'STAGING_DB_PASSWORD'),
                    string(credentialsId: 'whichbin-staging-db-root-password', variable: 'STAGING_DB_ROOT_PASSWORD'),
                    string(credentialsId: 'whichbin-client-url', variable: 'PRODUCTION_CLIENT_URL'),
                    string(credentialsId: 'whichbin-staging-client-url', variable: 'STAGING_CLIENT_URL')
                ]) {
                    powershell '''
                        $PSNativeCommandUseErrorActionPreference = $false
                        if ($env:DEPLOYMENT_ENVIRONMENT -eq 'staging') {
                            $env:DB_USERNAME = $env:STAGING_DB_USERNAME
                            $env:DB_PASSWORD = $env:STAGING_DB_PASSWORD
                            $env:DB_ROOT_PASSWORD = $env:STAGING_DB_ROOT_PASSWORD
                            $env:CLIENT_URL = $env:STAGING_CLIENT_URL
                        } else {
                            $env:DB_USERNAME = $env:PRODUCTION_DB_USERNAME
                            $env:DB_PASSWORD = $env:PRODUCTION_DB_PASSWORD
                            $env:DB_ROOT_PASSWORD = $env:PRODUCTION_DB_ROOT_PASSWORD
                            $env:CLIENT_URL = $env:PRODUCTION_CLIENT_URL
                        }

                        $nginxDirectory = 'C:\WhichBin\nginx'
                        $nginxCertsDirectory = Join-Path $nginxDirectory 'certs'
                        $nginxConfigSource = Join-Path $env:WORKSPACE 'deployment\nginx\nginx.conf'
                        $nginxComposeSource = Join-Path $env:WORKSPACE 'deployment\nginx\compose.yaml'
                        $nginxConfigPath = Join-Path $nginxDirectory 'nginx.conf'
                        $nginxComposePath = Join-Path $nginxDirectory 'compose.yaml'
                        $nginxConfigHashPath = Join-Path $nginxDirectory 'nginx.conf.sha256'
                        $tempPfxPath = Join-Path $env:WORKSPACE "whichbin-tls-$env:BUILD_NUMBER.pfx"
                        $certificateHashPath = Join-Path $nginxCertsDirectory 'wildcard-pfx.sha256'
                        New-Item -ItemType Directory -Path $nginxDirectory -Force | Out-Null
                        Copy-Item -LiteralPath $nginxComposeSource -Destination $nginxComposePath -Force
                        $nginxConfigHash = (Get-FileHash -LiteralPath $nginxConfigSource -Algorithm SHA256).Hash
                        $nginxConfigChanged = -not (Test-Path -LiteralPath $nginxConfigHashPath) -or
                            ((Get-Content -LiteralPath $nginxConfigHashPath -Raw).Trim() -ne $nginxConfigHash)
                        if ($nginxConfigChanged) {
                            Copy-Item -LiteralPath $nginxConfigSource -Destination $nginxConfigPath -Force
                        }
                        Copy-Item -LiteralPath $env:JENKINS_TLS_CERT_FILE -Destination $tempPfxPath -Force

                        try {
                            $pfxHash = (Get-FileHash -LiteralPath $tempPfxPath -Algorithm SHA256).Hash
                            $certificateChanged = -not (Test-Path -LiteralPath $certificateHashPath) -or
                                ((Get-Content -LiteralPath $certificateHashPath -Raw).Trim() -ne $pfxHash)
                            if ($certificateChanged) {
                                docker run --rm `
                                    --volume "${tempPfxPath}:/input/certificate.pfx:ro" `
                                    --volume "${nginxCertsDirectory}:/output" `
                                    --env "PFX_PASSWORD=$env:JENKINS_TLS_KEYSTORE_PASSWORD" `
                                    --entrypoint sh alpine/openssl:3.5.9 -c 'openssl pkcs12 -in /input/certificate.pfx -nokeys -out /output/fullchain.pem.tmp -passin env:PFX_PASSWORD && openssl pkcs12 -in /input/certificate.pfx -nocerts -noenc -out /output/privkey.pem.tmp -passin env:PFX_PASSWORD && chmod 600 /output/privkey.pem.tmp'
                                if ($LASTEXITCODE -ne 0) {
                                    throw 'Could not convert the Jenkins PFX credential to NGINX PEM files.'
                                }
                                Move-Item -LiteralPath (Join-Path $nginxCertsDirectory 'fullchain.pem.tmp') -Destination (Join-Path $nginxCertsDirectory 'fullchain.pem') -Force
                                Move-Item -LiteralPath (Join-Path $nginxCertsDirectory 'privkey.pem.tmp') -Destination (Join-Path $nginxCertsDirectory 'privkey.pem') -Force
                            }

                            $nginxContainer = docker ps --filter 'name=^/whichbin-nginx$' --format '{{.Names}}'
                            if ($LASTEXITCODE -ne 0) {
                                throw 'Could not check whether the NGINX proxy is running.'
                            }
                            if ($nginxContainer -and ($certificateChanged -or $nginxConfigChanged)) {
                                docker exec whichbin-nginx nginx -t
                                if ($LASTEXITCODE -ne 0) {
                                    throw 'The NGINX configuration or TLS certificate failed validation.'
                                }
                                docker exec whichbin-nginx nginx -s reload
                                if ($LASTEXITCODE -ne 0) {
                                    throw 'The NGINX proxy failed to reload its configuration or TLS certificate.'
                                }
                            }
                            Set-Content -LiteralPath $nginxConfigHashPath -Value $nginxConfigHash -NoNewline
                            Set-Content -LiteralPath $certificateHashPath -Value $pfxHash -NoNewline

                            $composeFile = Join-Path $env:WORKSPACE "deployment\$($env:DEPLOYMENT_ENVIRONMENT)\compose.yaml"
                            $env:IMAGE_TAG = "$($env:DEPLOYMENT_ENVIRONMENT)-$env:APP_VERSION"
                            docker compose --project-name "whichbin-$env:DEPLOYMENT_ENVIRONMENT" --file $composeFile up -d --build --remove-orphans
                            if ($LASTEXITCODE -ne 0) {
                                throw "Docker Compose deployment failed for $env:DEPLOYMENT_ENVIRONMENT."
                            }
                        } finally {
                            Remove-Item -LiteralPath $tempPfxPath -Force -ErrorAction SilentlyContinue
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
                                    environment_url = $env:DEPLOYMENT_URL
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
