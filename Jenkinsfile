pipeline {
    agent any

    environment {
        VM_IP = "20.109.102.61"
    }

    stages {

        stage('Set Branch Config') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'main') {
                        env.APP_PORT = '3000'
                        env.APP_DIR  = 'main-app'
                    } 
                    else if (env.BRANCH_NAME == 'stag') {
                        env.APP_PORT = '3001'
                        env.APP_DIR  = 'staging-app'
                    } 
                    else {
                        error "Unsupported branch: ${env.BRANCH_NAME}"
                    }
                }
            }
        }

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Deploy to Azure VM') {
            steps {
                    withCredentials([
                    string(credentialsId: 'VM_USER', variable: 'VM_USER'),
                    string(credentialsId: 'VM_PASS', variable: 'VM_PASS')
                ]) {
                    sh '''
                        echo "Deploying ${BRANCH_NAME} on port ${APP_PORT}"

                        sshpass -p "$VM_PASS" ssh -o StrictHostKeyChecking=no $VM_USER@$VM_IP "
                            mkdir -p /home/$VM_USER/${APP_DIR}
                        "

                        sshpass -p "$VM_PASS" scp -o StrictHostKeyChecking=no -r . $VM_USER@$VM_IP:/home/$VM_USER/${APP_DIR}/
                        sshpass -p "$VM_PASS" ssh -o StrictHostKeyChecking=no $VM_USER@$VM_IP "
                            cd /home/$VM_USER/${APP_DIR}

                            sudo apt update -y
                            sudo apt install -y nodejs npm

                            npm install

                            PID=\\$(lsof -ti:${APP_PORT} || true)
                            if [ ! -z \\"\\$PID\\" ]; then
                                kill -9 \\$PID
                            fi

                            export APP_PORT=${APP_PORT}

                            nohup node app.js > app.log 2>&1 &

                            sleep 3
                            curl -I http://localhost:${APP_PORT} || true
                        "
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Deployed ${BRANCH_NAME} at http://${VM_IP}:${APP_PORT}"
        }
    }
}
