import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as aws_ec2 from "aws-cdk-lib/aws-ec2";
import * as aws_ssm from "aws-cdk-lib/aws-ssm";
import * as aws_ecr from "aws-cdk-lib/aws-ecr";

export class AwsMinecraftBootsrapStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC to deploy the Minecraft infrastructure to
    const vpc = new aws_ec2.Vpc(this, "rMinecraftVpc", {
      vpcName: "MinecraftVpc",
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "MinecraftPublicSubnet",
          subnetType: aws_ec2.SubnetType.PUBLIC,
        },
      ],
      natGateways: 0,
      restrictDefaultSecurityGroup: true,
    });

    // Create an ECR repository to store the Minecraft Docker image
    const repository = new aws_ecr.Repository(this, "rMinecraftRepository", {
      repositoryName: "minecraft-server",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
    });

    // Save bootstrap information to SSM Parameter Store
    new aws_ssm.StringParameter(this, "rVpcIdParameter", {
      parameterName: `${this.stackName}/VpcId`,
      stringValue: vpc.vpcId,
      description: "VPC ID of the Minecraft VPC",
    });

    new aws_ssm.StringListParameter(this, "rPublicSubnetIdsParameter", {
      parameterName: `${this.stackName}/PublicSubnetIds`,
      stringListValue: vpc.publicSubnets.map((subnet) => subnet.subnetId),
      description: "Public Subnet IDs of the Minecraft VPC",
    });

    new aws_ssm.StringParameter(this, "rRepositoryNameParameter", {
      parameterName: `${this.stackName}/RepositoryName`,
      stringValue: repository.repositoryName,
      description: "ECR Repository Name for the Minecraft Docker image",
    });

    new aws_ssm.StringParameter(this, "rRepositoryUriParameter", {
      parameterName: `${this.stackName}/RepositoryUri`,
      stringValue: repository.repositoryUri,
      description: "ECR Repository URI for the Minecraft Docker image",
    });

    // Outputs for the CloudFormation stack
    new cdk.CfnOutput(this, "oVpcId", {
      value: vpc.vpcId,
      description: "VPC ID",
      exportName: "VpcId",
    });

    new cdk.CfnOutput(this, "oVpcCidr", {
      value: vpc.vpcCidrBlock,
      description: "VPC CIDR Block",
      exportName: "VpcCidrBlock",
    });

    new cdk.CfnOutput(this, "oPublicSubnetIds", {
      value: vpc.publicSubnets.map((subnet) => subnet.subnetId).join(","),
      description: "Public Subnet IDs",
      exportName: "PublicSubnetIds",
    });

    new cdk.CfnOutput(this, "oRepositoryName", {
      value: repository.repositoryName,
      description: "ECR Repository Name",
      exportName: "RepositoryName",
    });

    new cdk.CfnOutput(this, "oRepositoryUri", {
      value: repository.repositoryUri,
      description: "ECR Repository URI",
      exportName: "RepositoryUri",
    });
  }
}
