pipeline {
    agent {
        label 'newNode'
    }
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

                        # Step 1: Create directory on VM
                        sshpass -p "$VM_PASS" ssh -o StrictHostKeyChecking=no $VM_USER@$VM_IP "
                            mkdir -p /home/$VM_USER/${APP_DIR}
                            sudo chown -R $VM_USER:$VM_USER /home/$VM_USER/${APP_DIR}/
                        "

                        # Step 2: Copy latest code to VM
                        sshpass -p "$VM_PASS" rsync -av \
                            --exclude='.git' \
                            --exclude='node_modules' \
                            -e "ssh -o StrictHostKeyChecking=no" \
                            . $VM_USER@$VM_IP:/home/$VM_USER/${APP_DIR}/

                        # Step 3: Install deps and manage process with PM2
                        sshpass -p "$VM_PASS" ssh -o StrictHostKeyChecking=no $VM_USER@$VM_IP "
                            cd /home/$VM_USER/${APP_DIR}

                            # Install Node/npm if not present
                            sudo apt update -y
                            sudo apt install -y nodejs npm

                            # Install PM2 globally if not present
                            which pm2 || sudo npm install -g pm2

                            # Install app dependencies
                            npm install

                            # If app already running -> restart it (picks up new code)
                            # If not running -> start it fresh
                            pm2 describe ${APP_DIR} > /dev/null 2>&1 \
                                && pm2 restart ${APP_DIR} \
                                || pm2 start app.js \
                                    --name ${APP_DIR} \
                                    --env APP_PORT=${APP_PORT}

                            # Save PM2 process list (survives reboots)
                            pm2 save

                            # Enable PM2 to start on system boot
                            sudo pm2 startup systemd -u $VM_USER --hp /home/$VM_USER || true

                            # Wait and verify
                            sleep 3
                            curl -I http://localhost:${APP_PORT} || true

                            # Show recent logs
                            echo '===== PM2 Status ====='
                            pm2 status

                            echo '===== App Logs ====='
                            pm2 logs ${APP_DIR} --lines 20 --nostream
                        "
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Deployed ${BRANCH_NAME} on http://${VM_IP}:${APP_PORT}"
        }
        failure {
            echo "Deployment failed for ${BRANCH_NAME}"
        }
    }
}
