images = {
    "minecraft-server": {
        "itzg/minecraft-server": [
            "latest",
            "java-17",
            "java-21",
        ]
    }
}


if "__main__" == __name__:
    """This script is used to booststrap the ECR repository with images defined in the images dict."""
