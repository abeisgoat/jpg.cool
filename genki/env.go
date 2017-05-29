package main

import (
	"io/ioutil"
	"log"
	"encoding/json"
)

// Env is a environment / structure (as per env.json)
type Env struct {
	Port int
	AzureKey string
	GCSBucket string

}

// GetEnv loads environmental variables from ./env.json
func GetEnv() (env Env) {
	raw, ioErr := ioutil.ReadFile("./env.json")
	if ioErr != nil {
		log.Fatalln(ioErr.Error())
	}

	if err := json.Unmarshal(raw, &env); err != nil {
		log.Fatalln(err.Error())
	}
	return
}

