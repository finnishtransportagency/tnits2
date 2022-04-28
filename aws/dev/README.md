# TN-ITS kehitys, pystytys

## VPC
Tarkista, että kehitystilille on luotu VPC kahdella subnetillä. Tarkista yhtenevät parametrien nimet, esim. NetworkStackName VPC:n ja CloudFormation parametreistä.

## Kloonaa repo koneelle
```
git clone https://github.com/finnishtransportagency/tnits2.git
cd tnits2
```

## Aseta ympäristömuuttujat
*Huom.* ympäristömuuttujat säilyvät vain shell / cmd session ajan

*Windows Command Prompt*
```
setx AWS_DEFAULT_REGION eu-west-1
setx AWS_PROFILE vaylaapp
```

*Linux / macOS*
```
export AWS_DEFAULT_REGION=eu-west-1
export AWS_PROFILE=vaylaapp
```

## AWS CLI komennot

**HUOM tarkista ennen jokaista create-stack komentoa parametritiedostojen sisältö**

### Luo parametrit parameterStoreen
Parametrit luodaan tyypillä "String" ja arvolla "placeHolderValue".
```
aws cloudformation create-stack \
--stack-name [esim. tnits2-dev-parameter-store-entries] \
--template-body file://aws/cloudformation/parameter-store/parameter-template.yaml \
--parameters ParameterKey=ApplicationName,ParameterValue=tnits2 ParameterKey=Environment,ParameterValue=dev \
--tags file://aws/dev/tags.json
```

### Päivitä parametrien arvot ja tyypit oikein
Kunkin parametrin tyypiksi vaihdetaan "SecureString" ja arvoksi asetetaan parametrin oikea arvo (X = kehitystiimiltä pyydetty arvo)
```
aws ssm put-parameter --overwrite --name /tnits2/dev/apikey/digiroad --type SecureString --value X
```

### Luo ECR repository
```
aws cloudformation create-stack \
--stack-name [esim. tnits2-dev-ecr] \
--template-body file://aws/cloudformation/ecr/dev-ecr-template.yaml \
--parameters file://aws/dev/ecr-parameter.json \
--tags file://aws/dev/tags.json
```
Repositoryn luonnin jälkeen pyydä kehitystiimiä toimittamaan sinne palvelun image ennen seuraavaa vaihetta

### Luo TN-ITS resurssit
```
aws cloudformation create-stack \
--stack-name [esim. tnits2-dev-resources] \
--template-body file://aws/cloudformation/tnits-template.yaml \
--parameters file://aws/dev/tnits-parameter.json \
--tags file://aws/dev/tags.json \
--capabilities CAPABILITY_NAMED_IAM
```

### Luo kehitys pipeline
*Huom.* Korvaa GitHubWebhookSecret oikealla arvolla
```
aws cloudformation create-stack 
--stack-name [esim. tnits2-dev-pipeline] 
--template-body file://aws/cloudformation/cicd/dev-cicd-template.yaml 
--parameters file://aws/dev/cicd-parameter.json 
--tags file://aws/dev/tags.json 
--capabilities CAPABILITY_NAMED_IAM
```

### Luo tuotanto pipeline
*Huom.* Korvaa GitHubWebhookSecret oikealla arvolla
```
aws cloudformation create-stack
--stack-name [esim. tnits2-prod-pipeline]
--template-body file://aws/cloudformation/cicd/prod-cicd-template.yaml 
--parameters file://aws/prod/cicd-parameter.json 
--tags file://aws/prod/tags.json 
--capabilities CAPABILITY_NAMED_IAM
```

### Salli API Gatewayn lokitus
*Huom.* Tehdään vain jos alueen API Gatewayille ei ole vielä määritetty CloudWatch lokitus oikeutta. Varmista lisäksi että roolin nimi vastaa tnits-template.yaml:lla luotua (ApiGatewayLogRole)
```
aws apigateway update-account \
--patch-operations op='add',path='/cloudwatchRoleArn',value='arn:aws:iam::[Account_ID]:role/dev-tnits2-apigateway-log-role'
```

### Vie skeemat S3
*Huom.* Varmista että S3 bucketin nimi vastaa tnits-template.yaml:lla luotua (SchemaStoreBucket)
```
aws s3 cp schemas/ s3://dev-vaylapilvi-tnits2-schema-store-bucket/ --recursive

```

### Laita konversion ajastus pois päältä
Disabloi konversio lambdan käynnistävä EventBridge sääntö.
*Huom.* Varmista että eventin nimi vastaa tnits-template.yaml:lla luotua
```
aws events disable-rule --name dev-tnits2-conversion-event
```

### Laita konversion ajastus päälle
Laita konversio lambdan käynnistävä EventBridge sääntö takaisin päälle siinä vaiheessa, kun Digiroad aws yliheitto on tehty.
*Huom.* Varmista että eventin nimi vastaa tnits-template.yaml:lla luotua
```
aws events enable-rule --name dev-tnits2-conversion-event
```

# TN-ITS kehitys, päivitys

## Aseta ympäristömuuttujat
*Huom.* ympäristömuuttujat säilyvät vain shell / cmd session ajan

*Windows Command Prompt*
```
setx AWS_DEFAULT_REGION eu-west-1
setx AWS_PROFILE vaylaapp
```

*Linux / macOS*
```
export AWS_DEFAULT_REGION=eu-west-1
export AWS_PROFILE=vaylaapp
```

## AWS CLI komennot

**HUOM tarkista ennen jokaista update-stack komentoa parametritiedostojen sisältö**

### Päivitä ECR repository
```
aws cloudformation create-stack \
--stack-name [esim. tnits2-dev-ecr] \
--template-body file://aws/cloudformation/ecr/dev-ecr-template.yaml \
--parameters file://aws/dev/ecr-parameter.json \
--tags file://aws/dev/tags.json
```

### Päivitä TN-ITS resurssit
*Huom.* Korvaa parametrit sisältävän tiedoston parametri "ECRImageTag" kehitystiimiltä saadulla ECRImageTag parametrin arvolla. 
```
aws cloudformation update-stack \
--stack-name [esim. tnits2-dev-resources] \
--template-body file://aws/cloudformation/tnits-template.yaml \
--parameters file://aws/dev/tnits-parameter.json \
--capabilities CAPABILITY_NAMED_IAM
```
Lisää komentoon mukaan *--tags file://aws/dev/tags.json* mikäli halutaan päivittää myös tagit.

### Päivitä kehitys pipeline
*Huom.* Korvaa GitHubWebhookSecret oikealla arvolla
```
aws cloudformation update-stack 
--stack-name [esim. tnits2-dev-pipeline] 
--template-body file://aws/cloudformation/cicd/dev-cicd-template.yaml 
--parameters file://aws/dev/cicd-parameter.json 
--tags file://aws/dev/tags.json 
--capabilities CAPABILITY_NAMED_IAM
```

### Päivitä tuotanto pipeline
*Huom.* Korvaa GitHubWebhookSecret oikealla arvolla
```
aws cloudformation update-stack
--stack-name [esim. tnits2-prod-pipeline]
--template-body file://aws/cloudformation/cicd/prod-cicd-template.yaml 
--parameters file://aws/prod/cicd-parameter.json 
--tags file://aws/prod/tags.json 
--capabilities CAPABILITY_NAMED_IAM
```

## Tee uusi API Gateway deployment
```
 aws apigateway create-deployment --rest-api-id [API Gatewayn id] --region eu-west-1 --stage-name public
```

### Vie skeemat S3 (tarvittaessa)
*Huom.* Varmista että S3 bucketin nimi vastaa tnits-template.yaml:lla luotua (SchemaStoreBucket)
```
aws s3 cp schemas/ s3://dev-vaylapilvi-tnits2-schema-store-bucket/ --recursive

```