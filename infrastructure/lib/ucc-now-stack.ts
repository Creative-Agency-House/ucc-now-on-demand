import { CloudFrontToS3 } from "@aws-solutions-constructs/aws-cloudfront-s3";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";

export class UccNowStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const deployment = new CloudFrontToS3(this, "ucc-now-website", {
      logS3AccessLogs: false,
      logCloudFrontAccessLog: false,
      insertHttpSecurityHeaders: false,
    });

    const bucketName = deployment.s3Bucket?.bucketName;
    const distributionId = deployment.cloudFrontWebDistribution.distributionId;
    const distributionDomain = deployment.cloudFrontWebDistribution.domainName;

    new cdk.CfnOutput(this, "bucketName", { value: bucketName ?? "" });
    new cdk.CfnOutput(this, "distributionId", { value: distributionId ?? "" });
    new cdk.CfnOutput(this, "distributionDomain", {
      value: distributionDomain ?? "",
    });
  }
}
