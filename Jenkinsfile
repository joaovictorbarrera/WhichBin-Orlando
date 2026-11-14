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
                            & .\mvnw.cmd --batch-mode --no-transfer-progress "-Drevision=$env:APP_VERSION" test
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

        stage('Build and deploy') {
            steps {
                withCredentials([
                    file(credentialsId: 'whichbin-tls-pfx', variable: 'TLS_CERT_FILE'),
                    string(credentialsId: 'whichbin-db-username', variable: 'DB_USERNAME'),
                    string(credentialsId: 'whichbin-db-password', variable: 'DB_PASSWORD'),
                    string(credentialsId: 'whichbin-db-root-password', variable: 'DB_ROOT_PASSWORD'),
                    string(credentialsId: 'whichbin-tls-keystore-password', variable: 'TLS_KEYSTORE_PASSWORD'),
                    string(credentialsId: 'whichbin-client-url', variable: 'CLIENT_URL')
                ]) {
                    powershell '''
                        $PSNativeCommandUseErrorActionPreference = $false
                        docker compose up -d --build --remove-orphans
                        if ($LASTEXITCODE -ne 0) {
                            throw 'Docker Compose deployment failed.'
                        }
                    '''
                }
            }
        }
    }
}
