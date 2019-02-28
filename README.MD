# Installation

```
npm install
```

## Configuration

* Copy and rename .env.default to .env
* Add your parameter
* Note: Checked in the .env file. Passwords can be changed

## Create your PEM files

Create your public and private key for the JWT signature:

```
$ openssl genrsa -out config/jwt/private.pem -aes256 4096
$ openssl rsa -pubout -in config/jwt/private.pem -out config/jwt/public.pem
```


# Features

* JWT Authentification with PEM file based signature and passphrase
* API Routes for registration and login


#API

### USER MODULE 
#### `\users\register` : POST :  Create a new User
* Requires `name`, `email` and `password`
* `secret` can be passed to create `Admin` user 

#### `\users\login` : POST : Log into the appplication

* Requires `email` and `password`
* Returns a `JWT` token


### CANDIDATE MODULE

#### `\candidate` : GET : Get a list of candidates
* Requires `Authorization` header with a `Bearer` token
* Returns list of candidates
* If user is `Admin` total votes for each candidate comes
* If user is `Non-Admin` his/her previous votes are returned 

### `\candidate` : POST : Create a new candidate
* Only `Admin` user ca create a candidate
* Returns the `id` of the newly created candidate
* Requires a `candidateName` 

### `candidate\vote\:cadidateId` : GET : Votes for a candidate
* Only `Non Admin` user can vote
* A user can only vote once