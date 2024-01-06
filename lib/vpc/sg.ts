import { RemovalPolicy } from "aws-cdk-lib";
import { ISecurityGroup, IVpc, Peer, Port, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

interface SgProps {
    name: string;
    vpc: IVpc;
}

export function createSg(scope: Construct, props: SgProps): ISecurityGroup {

    console.log('props: ', props)

    const { name, vpc } = props;
    console.log('VPC CIDR Block:', vpc.vpcCidrBlock);

    const vpc_sg = new SecurityGroup(scope, name, {
        vpc: vpc,
        allowAllOutbound: true,
    });

    vpc_sg.addIngressRule(Peer.ipv4(vpc.vpcCidrBlock), Port.tcp(443));

    vpc_sg.applyRemovalPolicy(RemovalPolicy.DESTROY)

    // return vpc_sg;
    return vpc_sg;
}