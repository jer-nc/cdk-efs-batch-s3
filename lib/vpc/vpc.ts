import { RemovalPolicy } from "aws-cdk-lib";
import { GatewayVpcEndpointAwsService, IVpc, InterfaceVpcEndpointAwsService, Vpc } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

interface VpcProps {
    name: string;
    gatewayEndpointName: string;
}

export function createVpc(scope: Construct, props: VpcProps): IVpc {

    const vpc = new Vpc(scope, props.name);

    vpc.addGatewayEndpoint(props.gatewayEndpointName, {
        service: GatewayVpcEndpointAwsService.S3,
    });

    vpc.applyRemovalPolicy(RemovalPolicy.DESTROY)

    return vpc;
}