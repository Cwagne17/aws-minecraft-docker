require('dotenv').config();
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

/**
 * The minecraft stack bootstraps the nessecary AWS resources that'll
 * be used to create new minecraft worlds and manage them.
 */
export class MinecraftStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Store the CURSE FORGE API key in a systems manager parameter
    const curseForgeApiKey = new cdk.aws_ssm.StringParameter(this, "CFApiKey", {
      parameterName: "/minecraft/cf-api-key",
      stringValue: process.env.CF_API_KEY ?? "",
    });

    // Try and get the default VPC
    const defaultVpc = cdk.aws_ec2.Vpc.fromLookup(this, "VPC", {
      isDefault: true,
    });

    // Create an ECS cluster that runs on Fargate
    const cluster = new cdk.aws_ecs.Cluster(this, "MinecraftCluster", {
      clusterName: "MinecraftCluster",
      vpc: defaultVpc ?? undefined,
      enableFargateCapacityProviders: true,
      containerInsights: false, // TODO: May want to make this optional
    });

    // Create a cloud watch log group for all minecraft logs
    const logGroup = new cdk.aws_logs.LogGroup(this, "MinecraftLogGroup", {
      logGroupName: "/ecs/minecraft",
      retention: cdk.aws_logs.RetentionDays.THREE_DAYS, // TODO: Make this configurable
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Store the log group name in a systems manager parameter
    const ssmParameter = new cdk.aws_ssm.StringParameter(this, "MinecraftLogGroupParameter", {
      parameterName: "/minecraft/log-group",
      stringValue: logGroup.logGroupName,
    });

    // Output the resources that were created

    new cdk.CfnOutput(this, "ClusterName", {
      value: cluster.clusterName,
      description: "The ECS cluster that will run the minecraft server",
    });

    new cdk.CfnOutput(this, "VpcId", {
      value: cluster.vpc?.vpcId,
      description: "The VPC that the ECS cluster is running in",
    });

    new cdk.CfnOutput(this, "LogGroup", {
      value: logGroup.logGroupName,
      description: "The log group for all minecraft logs",
    });

    new cdk.CfnOutput(this, "SSMParameterName", {
      value: ssmParameter.parameterName,
      description: "The SSM parameter name for the log group",
    });
  }
}
