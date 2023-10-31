pipeline {
  agent { label 'linux' }

  options {
    disableConcurrentBuilds()
    /* manage how many builds we keep */
    buildDiscarder(logRotator(
      numToKeepStr: '20',
      daysToKeepStr: '30',
    ))
  }

  environment {
    GIT_COMMITTER_NAME = 'status-im-auto'
    GIT_COMMITTER_EMAIL = 'auto@status.im'
  }

  stages {
    stage('Build') {
      steps {
        sh 'mdbook build'
      }
    }

    stage('Publish') {
      steps {
        sshagent(credentials: ['status-im-auto-ssh']) {
          sh "ghp-import -p book"
        }
      }
    }
  }
}