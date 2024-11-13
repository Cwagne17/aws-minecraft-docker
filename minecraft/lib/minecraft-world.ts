import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';


export interface MinecraftWorldProps extends cdk.StackProps {
    /**
     * The modpack is the 'slug' that can be found in the CurseForge URL.
     * For example, 'https://www.curseforge.com/minecraft/modpacks/prominence-2-rpg' would have a slug of 'prominence-2-rpg'.
     */
    modpack: string;

    /**
     * The version of Minecraft to use for the minecraft server. This value is specific to the modpack.
     * Check the modpack's documentation for the correct version.
     */
    minecraftVersion: string;

    /**
     * The version of Java to use for the minecraft server.
     */
    javaVersion: string;

    /**
     * The amount of memory (GiB) to allocate to the minecraft server.
     * The default is sufficient for a vanilla server. When using a modpack this value should be increased according to the modpack's requirements.
     * 
     * 
     */
    memory: number;

    /**
     * The amount of vCPU to allocate to the minecraft server. This value must be compatible with the memory selected.
     * Refer to https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html#task_size for more information of supported sizing.
     */
    cpu: number;
}

export class MinecraftWorld extends cdk.Stack {
    readonly modpack: string;
    readonly minecraftVersion: string;
    readonly javaVersion: string;
    readonly memory: number;
    readonly cpu: number;

    constructor(scope: Construct, id: string, props: MinecraftWorldProps) {
        super(scope, id, props);
        
        // Set the properties
        this.modpack = props.modpack;
        this.minecraftVersion = props.minecraftVersion;
        this.javaVersion = props.javaVersion;
        this.memory = props.memory;
        this.cpu = props.cpu;


        // Read from the SSM parameter store to get the log group name
        const logGroupName = cdk.aws_ssm.StringParameter.valueFromLookup(this, "/minecraft/log-group");
        const cfApiKey = cdk.aws_ssm.StringParameter.valueFromLookup(this, "/minecraft/cf-api-key");

        // Create an ECS task definition that configures the minecraft server
        const taskDefinition = new cdk.aws_ecs.FargateTaskDefinition(this, "MinecraftTaskDefinition", {
            cpu: this.cpu * 1024,
            memoryLimitMiB: this.memory * 1024,
            runtimePlatform: {
                cpuArchitecture: cdk.aws_ecs.CpuArchitecture.X86_64,
                operatingSystemFamily: cdk.aws_ecs.OperatingSystemFamily.LINUX,
            },
        });

        // Add a container to the task definition that runs the minecraft server
        taskDefinition.addContainer("MinecraftContainer", {
            image: cdk.aws_ecs.ContainerImage.fromRegistry(`itzg/minecraft-server:java${this.javaVersion}`),
            containerName: this.modpack,
            environment: {
                USE_AIKAR_FLAGS: "true",
                MEMORY: `${this.memory}G`,
                EULA: "true",
                VERSION: this.minecraftVersion,
                ALLOW_FLIGHT: "true",
                MOD_PLATFORM: "AUTO_CURSEFORGE",
                CF_API_KEY: cfApiKey,
                CF_FORCE_SYNCHRONIZE: "true",
                CF_SLUG: this.modpack,
            },
            logging: cdk.aws_ecs.LogDrivers.awsLogs({
                logGroup: cdk.aws_logs.LogGroup.fromLogGroupName(this, "MinecraftLogGroup", logGroupName),
                streamPrefix: this.modpack,
            }),
            portMappings: [
                {
                    containerPort: 25565,
                    hostPort: 25565,
                }
            ],
            cpu: this.cpu * 1024,
        });

        // Output for the task definition ARN
        new cdk.CfnOutput(this, "TaskDefinitionArn", {
            value: taskDefinition.taskDefinitionArn,
            description: "The ARN of the ECS task definition that will run the minecraft server",
        });
    }
}