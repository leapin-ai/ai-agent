def build_command = "npm run build"
if (env.BRANCH_NAME == 'master') {
    build_command = "npm run build"
}

standardPipeline {
    projectName = "app"
    isMultiBranch = true
    buildCommand = {
        sh "${build_command}"
    }
    preBuildCommand = {
        sh "npm install"
    }
    buildLocalPath = "build"
    deployBranch = ['develop', 'master']
}
