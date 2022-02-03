# TN-ITS 2.0

Sisältää [TN-ITS CEN TS 17268](https://tn-its.eu/standardisation) standardin mukaan toteutetut API sekä konversio toteutukset.
Toteutus pitää sisällään neljä lambda funktiota (konversio, validointi, datasettien listaus sekä datasetin luku). 

## Projektin kloonaaminen omalle koneelle

```sh
git clone https://github.com/finnishtransportagency/tnits2.git
```

## Lambdojen testaaminen lokaalisti

Lamdojen testaamiseen lokaalisti hyödynnetään [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) komentorivityökalua.

Testaamisessa hyödynnetään dev ympäristön resursseja (s3, roolit yms). Jotkin tuotannossa käytössä olevat lambda eventit on otettu käsin pois käytöstä dev ympäristöstä testauksen helpottamiseksi.

### Testaamisessa käytettävät tiedostot

- ./aws/sam/template.yaml Funktioiden testaamiseen käytettävä SAM template
- ./env.json Sisältää testaamiseen tarvittavat ympäristömuuttujat lambdoille
- "Events" kansiosta löytyy testi eventit lambdoille. Huom! Viitattavien tiedostojen on sijaittava oikeasti dev ympäristön s3 bucketissa. Validointi lambdan eventissä oleva object key tulee olla url enkoodattu.

### Testaaminen lambdojen omilla rooleilla

Jotta lambdoja voitaisiin testata oikeilla pääsyoikeuksilla, tulee koneen .aws/config tiedostoon lisätä tiedot jokaiselle lambdan roolille, jotta niitä voidaan käyttää testaamisessa.

```sh
[profile LambdaRoleName]
role_arn = arn:aws:iam::ACCOUNT_ID:role/LAMBDA_ROLE_NAME
source_profile = vaylaapp
output = json
region = eu-west-1
```

- [profile LambdaRoleName] Korvaa kuvaavalla nimellä. Tätä käytetään myöhemmin sam local invoke kutsun yhteydessä --profile option kanssa.
- account_id Korvaa oikealla AWS account id:llä
- lambda_role_name Korvaa oikealla funktion dev ympäristön roolilla.

### Lokaali debug

```sh
sam build -t aws/sam/template.yaml --region REGION
sam local invoke LAMBDA_NAME --profile LAMBDA_ROLE_NAME --region REGION --env-vars env.json --event PATH_TO_EVENT_JSON --log-file debug.log
```

- "sam build" muodostaa container imagen. Ajetaan aina muutoksien jälkeen.
- "sam local invoke" käynnistää lokaalin lambda funktion annetuilla parametreilla