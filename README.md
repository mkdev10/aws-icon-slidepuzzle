# AWS アイコン スライドパズル

AWSサービスのアイコンを使ったスライドパズルゲームです。パズルを完成させた後、そのサービス名を4択から選んで答える学習ゲームです。

## 特徴

- **307種類のAWSサービス**: EC2、S3、Lambda、RDS、DynamoDB、VPC、ECS、EKS、SageMaker、Rekognition、IoT Core、ElastiCache、Redshift、CloudFormation、Route 53、WAF、EMR、Glue、Athena、Systems Manager、CloudWatch、Backup、EFS、EBS、Aurora、OpenSearch、App Mesh、Braket、RoboMaker、Textract、Transfer Family、WorkSpaces、Location Service、Amplify、EventBridge、MQ、Cloud9、SES、Pinpoint、API Gateway、SNS、SQS、Step Functions、Kinesis、CodeCommit、CodeBuild、CodeDeploy、CodePipeline、Bedrock、Q、Nova、GuardDuty、Macie、Inspector、Security Hub、Cognito、Directory Service、Organizations、Control Tower、Config、CloudTrail、X-Ray、Trusted Advisor、Support、Professional Services、Training & Certification、Marketplace、IQ、Activate、Well-Architected Tool、Health Dashboard、Personal Health Dashboard、Service Catalog、Service Management Connector、Resource Access Manager、Resource Explorer、License Manager、Application Discovery Service、Migration Hub、Database Migration Service、Server Migration Service、Application Migration Service、Migration Evaluator、DataSync、Storage Gateway、Snowball、Snowball Edge、Direct Connect、Transit Gateway、PrivateLink、Client VPN、Site-to-Site VPN、Global Accelerator、CloudFront、Route 53、Elastic Load Balancing、Certificate Manager、WAF、Shield、Firewall Manager、Network Firewall、Verified Access、Private 5G、Ground Station、Satellite、Elemental MediaConnect、Elemental MediaConvert、Elemental MediaLive、Elemental MediaPackage、Elemental MediaStore、Elemental MediaTailor、Interactive Video Service、Elastic Transcoder、GameLift、Thinkbox Deadline、Thinkbox Frost、Thinkbox Krakatoa、Thinkbox Sequoia、Thinkbox Stoke、Thinkbox XMesh、Open 3D Engine、Lumberyard、DeepComposer、DeepLens、DeepRacer、DevOps Guru、CodeGuru、CodeWhisperer、CodeCatalyst、Cloud Development Kit、Infrastructure Composer、Application Composer、Proton、Copilot、App Runner、App Studio、AppConfig、AppFabric、AppSync、AppFlow、EventBridge、Step Functions、Simple Workflow Service、Batch、Parallel Cluster、Parallel Computing Service、HPC、SimSpace Weaver、RoboMaker、IoT Core、IoT Device Management、IoT Device Defender、IoT Analytics、IoT Events、IoT Greengrass、IoT SiteWise、IoT TwinMaker、IoT FleetWise、IoT ExpressLink、IoT Button、FreeRTOS、Panorama、Lookout for Vision、Lookout for Equipment、Lookout for Metrics、Monitron、Fraud Detector、Forecast、Personalize、Translate、Transcribe、Polly、Lex、Connect、Chime、Chime SDK、WorkSpaces、WorkSpaces Family、WorkDocs、WorkMail、AppStream 2.0、Lightsail、Lightsail for Research など

- **ゲームフロー**:
  1. スライドパズルを完成させる
  2. 完成したアイコンのサービス名を4択から選択
  3. 完了時間と移動回数を記録

- **機能**:
  - タイマー機能
  - 移動回数カウント
  - レスポンシブデザイン（スマートフォン対応）
  - シャッフル機能（解ける状態を保証）
  - **高度なランダム選択肢生成**: 各クイズの選択肢は動的に生成され、高いランダム性を持つ
  - **カテゴリベース学習**: 関連サービスが適切に混在した選択肢で学習効果を向上

## ファイル構成

```
aws-icon-slidepuzzle/
├── index.html          # メインHTMLファイル
├── style.css           # スタイルシート
├── script.js           # ゲームロジック
├── awsServices.json    # AWSサービス設定データ（307サービス）
├── asset/              # AWSアイコンSVGファイル（307個、64サイズ）
│   ├── Arch_Amazon-EC2_64.svg
│   ├── Arch_Amazon-Simple-Storage-Service_64.svg
│   ├── Arch_AWS-Lambda_64.svg
│   └── ... (64サイズのSVGファイル)
└── README.md           # このファイル
```

## 使用方法

1. `index.html` をWebブラウザで開く
2. 「ゲーム開始」ボタンをクリック
3. スライドパズルを完成させる
4. 4択クイズに答える
5. 結果を確認して「もう一度プレイ」

## 技術仕様

- **HTML5**: セマンティックなマークアップ
- **CSS3**: Flexbox、Grid、アニメーション
- **JavaScript (ES6+)**: モジュラー設計、イベント駆動
- **レスポンシブデザイン**: モバイルファースト

## ブラウザ対応

- Chrome (推奨)
- Firefox
- Safari
- Edge

## ライセンス

このプロジェクトで使用されているAWSアイコンは、Amazon Web Services, Inc.の著作物です。
ゲームコード自体はMITライセンスの下で提供されています。

## 学習効果

- AWSサービスのアイコンを視覚的に覚えられる
- サービス名とアイコンの関連付けができる
- ゲーム感覚で楽しく学習できる
- AWS認定試験の準備に役立つ

## 今後の拡張予定

- [ ] 難易度設定（4x4パズル）
- [ ] スコアランキング機能
- [ ] サービス説明の表示
- [ ] 音効果の追加
- [ ] より多くのAWSサービスの追加
