import { Role, CompositePrincipal, ServicePrincipal, ManagedPolicy, CfnInstanceProfile } from 'aws-cdk-lib/aws-iam';
import { CfnComputeEnvironment, CfnJobQueue, CfnJobDefinition } from 'aws-cdk-lib/aws-batch';
import { Construct } from 'constructs';
import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';
import { IFileSystem } from 'aws-cdk-lib/aws-efs';

interface BatchResourcesProps {
  vpc: IVpc;
  sg: ISecurityGroup; 
  efs: IFileSystem;
  dockerBaseImage: string;
  jobQueueName: string;
  computeEnvName: string;
  jobDefinitionName: string;
}

export const createBatchResources = (scope: Construct, props: BatchResourcesProps) => {
  const { vpc, sg, efs, dockerBaseImage, jobQueueName, computeEnvName, jobDefinitionName } = props;

  const batchInstanceRole = new Role(scope, 'batch-job-instance-role', {
    assumedBy: new CompositePrincipal(
      new ServicePrincipal('ec2.amazonaws.com'),
      new ServicePrincipal('ecs.amazonaws.com'),
      new ServicePrincipal('ecs-tasks.amazonaws.com'),
    ),
    managedPolicies: [
      ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonEC2ContainerServiceforEC2Role'),
    ],
  });

  const batchServiceRole = new Role(scope, 'BatchServiceRole', {
    assumedBy: new ServicePrincipal('batch.amazonaws.com'),
    managedPolicies: [
      ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSBatchServiceRole'),
    ],
  });

  const batchInstanceProfile = new CfnInstanceProfile(scope, 'InstanceProfile', {
    roles: [batchInstanceRole.roleName],
  });


  const computeEnvironment = new CfnComputeEnvironment(scope, 'ComputeEnvironment', {
    type: 'MANAGED',
    serviceRole: batchServiceRole.roleArn,
    computeEnvironmentName: computeEnvName,
    computeResources: {
      minvCpus: 0,
      maxvCpus: 256,
      desiredvCpus: 0,
      instanceTypes: ['optimal'],
      subnets: vpc.privateSubnets.map(subnet => subnet.subnetId),
      securityGroupIds: [sg.securityGroupId],
      instanceRole: batchInstanceProfile.attrArn,
      type: 'EC2'
    },
    state: 'ENABLED',
  });

  const jobQueue = new CfnJobQueue(scope, 'JobQueue', {
    jobQueueName: jobQueueName,
    computeEnvironmentOrder: [{
      order: 1,
      computeEnvironment: computeEnvironment.ref,
    }],
    priority: 1,
    state: 'ENABLED',
  });

  const batchJobDefinition = new CfnJobDefinition(scope, 'JobDefinition', {
    jobDefinitionName: jobDefinitionName,
    type: 'container',
    containerProperties: {
      image: dockerBaseImage,
      vcpus: 1,
      memory: 2000,
      volumes: [{
        name: 'efsVolume',
        efsVolumeConfiguration: {
          fileSystemId: efs.fileSystemId,
          rootDirectory: '/',
          transitEncryption: 'ENABLED',
        },
      }],
      mountPoints: [{
        containerPath: '/mnt/efs',
        sourceVolume: 'efsVolume',
      }],
    },
    retryStrategy: {
      attempts: 3,
    },
    timeout: {
      attemptDurationSeconds: 60 * 60, // 1 hour
    },
  });


  return {
    batchInstanceRole, 
    batchServiceRole,
    batchInstanceProfile,
    computeEnvironment,
    jobQueue,
    batchJobDefinition,
  };
};
