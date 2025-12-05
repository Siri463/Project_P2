pipeline {
    agent any
    
    environment {
        BACKEND_IMAGE = 'revtickets-backend'
        FRONTEND_IMAGE = 'revtickets-frontend'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Subodh-26/RevTicketsF.git'
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('backend') {
                    bat 'mvn clean package -DskipTests'
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Backend Image') {
                    steps {
                        dir('backend') {
                            bat """
                                docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} .
                                docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest
                            """
                        }
                    }
                }
                stage('Frontend Image') {
                    steps {
                        dir('frontend') {
                            bat """
                                docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} .
                                docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest
                            """
                        }
                    }
                }
            }
        }
        

    }
    
    post {
        success {
            echo 'Build successful! Docker images created.'
        }
        failure {
            echo 'Build failed!'
        }
        always {
            bat 'docker system prune -f'
        }
    }
}
