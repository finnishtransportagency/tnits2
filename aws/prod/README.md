# TN-ITS tuotanto, pystytys

## VPC
Tarkista, että tuotantotilille on luotu VPC kahdella subnetillä. Tarkista yhtenevät parametrien nimet, esim. NetworkStackName VPC:n ja CloudFormation parametreistä.

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
setx AWS_PROFILE centralized_service_admin
```

*Linux / macOS*
```
export AWS_DEFAULT_REGION=eu-west-1
export AWS_PROFILE=centralized_service_admin
```

## AWS CLI komennot

**HUOM tarkista ennen jokaista create-stack komentoa parametritiedostojen sisältö**

### Luo parametrit parameterStoreen
Parametrit luodaan tyypillä "String" ja arvolla "placeHolderValue".
```
aws cloudformation create-stack \
--stack-name [esim. tnits2-prod-parameter-store-entries] \
--template-body file://aws/cloudformation/parameter-store/parameter-template.yaml \
--parameters ParameterKey=ApplicationName,ParameterValue=tnits2 ParameterKey=Environment,ParameterValue=prod \
--tags file://aws/prod/tags.json
```

### Päivitä parametrien arvot ja tyypit oikein
Kunkin parametrin tyypiksi vaihdetaan "SecureString" ja arvoksi asetetaan parametrin oikea arvo (X = kehitystiimiltä pyydetty arvo)
```
aws ssm put-parameter --overwrite --name /tnits2/prod/apikey/digiroad --type SecureString --value X
```

### Luo ECR repository
```
aws cloudformation create-stack \
--stack-name [esim. tnits2-prod-ecr-repository] \
--template-body file://aws/cloudformation/ecr/prod-ecr-template.yaml \
--parameters file://aws/prod/ecr-parameter.json \
--tags file://aws/prod/tags.json
```
Repositoryn luonnin jälkeen pyydä kehitystiimiä toimittamaan sinne palvelun image ennen seuraavaa vaihetta

### Luo TN-ITS resurssit
```
aws cloudformation create-stack \
--stack-name [esim. tnits2-prod] \
--template-body file://aws/cloudformation/tnits-template.yaml \
--parameters file://aws/prod/tnits-parameter.json \
--tags file://aws/prod/tags.json \
--capabilities CAPABILITY_NAMED_IAM
```

### Salli API Gatewayn lokitus
*Huom.* Tehdään vain jos alueen API Gatewayille ei ole vielä määritetty CloudWatch lokitus oikeutta. Varmista lisäksi että roolin nimi vastaa tnits-template.yaml:lla luotua (ApiGatewayLogRole)
```
aws apigateway update-account \
--patch-operations op='add',path='/cloudwatchRoleArn',value='arn:aws:iam::[Account_ID]:role/prod-tnits2-apigateway-log-role'
```

### Vie skeemat S3
*Huom.* Varmista että S3 bucketin nimi vastaa tnits-template.yaml:lla luotua (SchemaStoreBucket)
```
aws s3 cp schemas/ s3://prod-vaylapilvi-tnits2-schema-store-bucket/ --recursive

```

### Laita konversion ajastus pois päältä
Disabloi konversio lambdan käynnistävä EventBridge sääntö.
*Huom.* Varmista että eventin nimi vastaa tnits-template.yaml:lla luotua
```
aws events disable-rule --name prod-tnits2-conversion-event
```

### Laita konversion ajastus päälle
Laita konversio lambdan käynnistävä EventBridge sääntö takaisin päälle siinä vaiheessa, kun Digiroad aws yliheitto on tehty.
*Huom.* Varmista että eventin nimi vastaa tnits-template.yaml:lla luotua
```
aws events enable-rule --name prod-tnits2-conversion-event
```

### Lisää lambdojen lokeille vanhenemisaika
*Huom.* Varmista että log-group-name on kirjoitettu oikein.

```
aws logs put-retention-policy --log-group-name /aws/lambda/prod-tnits2-dataset-conversion --retention-in-days 180
aws logs put-retention-policy --log-group-name /aws/lambda/prod-tnits2-dataset-validation --retention-in-days 180
aws logs put-retention-policy --log-group-name /aws/lambda/prod-tnits2-list-datasets --retention-in-days 90
aws logs put-retention-policy --log-group-name /aws/lambda/prod-tnits2-read-dataset --retention-in-days 90
```

# TN-ITS tuotanto, päivitys

## Aseta ympäristömuuttujat
*Huom.* ympäristömuuttujat säilyvät vain shell / cmd session ajan

*Windows Command Prompt*
```
setx AWS_DEFAULT_REGION eu-west-1
setx AWS_PROFILE centralized_service_admin
```

*Linux / macOS*
```
export AWS_DEFAULT_REGION=eu-west-1
export AWS_PROFILE=centralized_service_admin
```

## AWS CLI komennot

**HUOM tarkista ennen jokaista update-stack komentoa parametritiedostojen sisältö**

### Päivitä TN-ITS resurssit
*Huom.* Korvaa parametrit sisältävän tiedoston parametri "ECRImageTag" kehitystiimiltä saadulla ECRImageTag parametrin arvolla. 
```
aws cloudformation update-stack \
--stack-name [esim. tnits2-prod] \
--template-body file://aws/cloudformation/tnits-template.yaml \
--parameters file://aws/prod/tnits-parameter.json \
--capabilities CAPABILITY_NAMED_IAM
--profile xxxxx # Aseta profiili jos default ei ole oikea
```
Lisää komentoon mukaan *--tags file://aws/prod/tags.json* mikäli halutaan päivittää myös tagit. 

## Tee uusi API Gateway deployment
```
 aws apigateway create-deployment --rest-api-id [API Gatewayn id] --region eu-west-1 --stage-name public --profile xxxxx # Aseta profiili jos default ei ole oikea
```

### Vie skeemat S3 (tarvittaessa)
*Huom.* Varmista että S3 bucketin nimi vastaa tnits-template.yaml:lla luotua (SchemaStoreBucket)
```
aws s3 cp schemas/ s3://prod-vaylapilvi-tnits2-schema-store-bucket/ --recursive

```
