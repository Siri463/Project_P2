pipeline {
    agent any
    
    environment {
        DOCKER_HUB_USER = 'subodhxo'
        DOCKER_HUB_PASS = 'Subodh@2002'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/subodhxo/revtickets.git'
            }
        }
        
        stage('Build JARs') {
            steps {
                script {
                    sh 'cd microservices/eureka-server && mvn clean package -DskipTests'
                    sh 'cd microservices/api-gateway && mvn clean package -DskipTests'
                    sh 'cd microservices/user-service && mvn clean package -DskipTests'
                    sh 'cd microservices/movie-service && mvn clean package -DskipTests'
                    sh 'cd microservices/venue-service && mvn clean package -DskipTests'
                    sh 'cd microservices/booking-service && mvn clean package -DskipTests'
                    sh 'cd microservices/payment-service && mvn clean package -DskipTests'
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                sh 'cd frontend && npm install && npm run build'
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    sh 'docker build -t subodhxo/revtickets-eureka:latest ./microservices/eureka-server'
                    sh 'docker build -t subodhxo/revtickets-gateway:latest ./microservices/api-gateway'
                    sh 'docker build -t subodhxo/revtickets-user:latest ./microservices/user-service'
                    sh 'docker build -t subodhxo/revtickets-movie:latest ./microservices/movie-service'
                    sh 'docker build -t subodhxo/revtickets-venue:latest ./microservices/venue-service'
                    sh 'docker build -t subodhxo/revtickets-booking:latest ./microservices/booking-service'
                    sh 'docker build -t subodhxo/revtickets-payment:latest ./microservices/payment-service'
                    sh 'docker build -t subodhxo/revtickets-frontend:latest ./frontend'
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                script {
                    sh 'echo $DOCKER_HUB_PASS | docker login -u $DOCKER_HUB_USER --password-stdin'
                    sh 'docker push subodhxo/revtickets-eureka:latest'
                    sh 'docker push subodhxo/revtickets-gateway:latest'
                    sh 'docker push subodhxo/revtickets-user:latest'
                    sh 'docker push subodhxo/revtickets-movie:latest'
                    sh 'docker push subodhxo/revtickets-venue:latest'
                    sh 'docker push subodhxo/revtickets-booking:latest'
                    sh 'docker push subodhxo/revtickets-payment:latest'
                    sh 'docker push subodhxo/revtickets-frontend:latest'
                }
            }
        }
    }
    
    post {
        always {
            sh 'docker logout'
        }
    }
}
