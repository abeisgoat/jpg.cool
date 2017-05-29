package main

import (
	"github.com/codegangsta/cli"
	"os"
	"fmt"
	"net/http"
	"io/ioutil"
	"github.com/Sirupsen/logrus"
	"encoding/json"
)

var env Env

func main() {
	//env = GetEnv()

	env = Env{
		AzureKey: os.Getenv("azure_key"),
		GCSBucket: os.Getenv("gcs_bucket"),
	}

	app := cli.NewApp()
	app.Name = "Genki"
	app.Usage = "It's like peggy, but simpler, faster, and GCS based"
	app.Version = "0.0.2"
	app.Commands = []cli.Command{
		{
			Name:    "listen",
			Aliases: []string{"l"},
			Usage:   "listen for incoming jobs",
			Action:  CommandAction{Env: env, Function: listen}.Perform,
		},
		{
			Name:    "get-redirect",
			Aliases: []string{"gr"},
			Usage:   "get a single response",
			Flags: []cli.Flag {
				cli.StringFlag{
					Name: "phrase",
					Value: "",
					Usage: "phrase to search for",
				},
			},
			Action:  CommandAction{Env: env, Function: getRedirect}.Perform,
		},
		{
			Name:    "get",
			Aliases: []string{"g"},
			Usage:   "get a single response",
			Flags: []cli.Flag {
				cli.StringFlag{
					Name: "data",
					Value: "",
					Usage: "json body",
				},
				cli.StringFlag{
					Name: "params",
					Value: "",
					Usage: "params",
				},
			},
			Action:  CommandAction{Env: env, Function: get}.Perform,
		},
	}
	app.Run(os.Args)
}

func findHandler(w http.ResponseWriter, r *http.Request) {
	buf, err := ioutil.ReadAll(r.Body)
	defer r.Body.Close()

	var greq GenkiRequest
	json.Unmarshal(buf, &greq)

	gresp := GenkiResponse{}

	if (err != nil) {
		logrus.Warn(err)
		gresp.Value.URL = "https://error.jpg.cool"
	} else {
		bis := BingImageSearch{
			genkiRequest:greq,
			azureKey: env.AzureKey,
		}

		url, _ := bis.Do()
		gresp.Value.URL = url
	}

	buf, _ = json.Marshal(gresp)
	fmt.Fprintf(w, "%s", buf)
}

func listen(c *cli.Context, env Env) {
	port := fmt.Sprintf(":%d", env.Port)
	fmt.Printf("Listening on %s", port)
	http.HandleFunc("/perform/find", findHandler)
	http.ListenAndServe(port, nil)
}

type GetRedirectResponse struct {
	Redirect GoonRedirect `json:":goon-redirect"`
}

type GoonRedirect struct {
	Type int64 `json:"type"`
	Url string `json:"url"`
}

func getRedirect(c *cli.Context, env Env) {
	greq := GenkiRequest{Phrase: c.String("phrase")}

	bis := BingImageSearch{
		genkiRequest: greq,
		azureKey: env.AzureKey,
	}

	url, _ := bis.Do()

	gr := GetRedirectResponse{Redirect: GoonRedirect{
		Url: url,
		Type: 302,
	}}

	buf, _ := json.Marshal(gr)
	fmt.Printf("%s\n", buf)
}

type GetRequest struct {
	Phrase string `json:"phrase"`
	Url *string `json:"url,omitempty"`
	Error *bool `json:"error,omitempty"`
}

func get(c *cli.Context, env Env) {
	var req GetRequest
	dataBuf := []byte(c.String("data"))
	json.Unmarshal(dataBuf, &req)

	greq := GenkiRequest{Phrase: req.Phrase}

	bis := BingImageSearch{
		genkiRequest: greq,
		azureKey: env.AzureKey,
	}

	url, err:= bis.Do()

	if err != nil {
		is_error := true
		req.Error = &is_error
	} else {
		req.Url = &url
	}

	buf, _ := json.Marshal(req)
	fmt.Printf("%s\n", buf)
}