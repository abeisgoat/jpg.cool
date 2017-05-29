package main

import (
	"net/http"
	"github.com/Sirupsen/logrus"
	"io/ioutil"
	"fmt"
	"encoding/json"
	"io"
	"os"
	"golang.org/x/net/context"
	"cloud.google.com/go/storage"
	"github.com/satori/go.uuid"
	"strings"
	"gopkg.in/h2non/filetype.v1"
	"math"
	"errors"
)

type StupidBindURL struct {
	Query string
	Size string
}

func (sbu *StupidBindURL) ToString() (output string) {
	query := strings.Join(strings.Split(sbu.Query, " "), "%20")
	output = fmt.Sprintf("https://api.cognitive.microsoft.com/bing/v5.0/images/search?q=%s", query)
	return
}

type BingImageSearch struct {
	genkiRequest GenkiRequest
	azureKey string
}

type BingResponse struct {
	Type string `json:"_type"`
	Instrumentation struct {
		PageLoadPingURL string `json:"pageLoadPingUrl"`
	} `json:"instrumentation"`
	ReadLink string `json:"readLink"`
	WebSearchURL string `json:"webSearchUrl"`
	TotalEstimatedMatches int `json:"totalEstimatedMatches"`
	Value []struct {
		Name string `json:"name"`
		WebSearchURL string `json:"webSearchUrl"`
		ThumbnailURL string `json:"thumbnailUrl"`
		DatePublished string `json:"datePublished"`
		ContentURL string `json:"contentUrl"`
		HostPageURL string `json:"hostPageUrl"`
		ContentSize string `json:"contentSize"`
		EncodingFormat string `json:"encodingFormat"`
		HostPageDisplayURL string `json:"hostPageDisplayUrl"`
		Width int `json:"width"`
		Height int `json:"height"`
		Thumbnail struct {
			Width int `json:"width"`
			Height int `json:"height"`
		} `json:"thumbnail"`
		ImageInsightsToken string `json:"imageInsightsToken"`
		InsightsSourcesSummary struct {
			ShoppingSourcesCount int `json:"shoppingSourcesCount"`
			RecipeSourcesCount int `json:"recipeSourcesCount"`
		} `json:"insightsSourcesSummary"`
		ImageID string `json:"imageId"`
		AccentColor string `json:"accentColor"`
	} `json:"value"`
}

func (bis *BingImageSearch) Do() (string, error) {
	sbu := StupidBindURL{
		Query: bis.genkiRequest.Phrase,
		Size: "medium",
	}
	client := http.Client{}
	req, err := http.NewRequest("GET", sbu.ToString(), nil)

	if (err != nil) {
		logrus.Warning(err)
		return "https://jpg.cool/error.gif", err
	}

	req.Header.Add("Ocp-Apim-Subscription-Key", bis.azureKey)
	resp, err := client.Do(req)

	if (err != nil) {
		logrus.Warning(err)
		return "https://jpg.cool/error.gif", err
	}

	buf, err := ioutil.ReadAll(resp.Body)
	defer resp.Body.Close()

	var br BingResponse
	json.Unmarshal(buf, &br)

	var success bool
	var publicURL string
	var tmpfile *os.File

	maxR := math.Min(float64(len(br.Value)), 3)
	for r := 0.0; r < maxR; r++ {
		if (!success) {
			dataURL := br.Value[int(r)].ContentURL

			tmpfile, err = ioutil.TempFile("", "bing")
			defer os.Remove(tmpfile.Name())

			if (err != nil) {
				logrus.Warning("Can't create temp file!")
			} else {
				resp, err := http.Get(dataURL)

				if (err != nil) {
					logrus.Warningf("Invalid GET %s", err)
				} else {
					defer resp.Body.Close()

					_, err = io.Copy(tmpfile, resp.Body)

					if (err != nil) {
						logrus.Warningf("Failed download attempt %d", r)
					} else {
						buf, _ := ioutil.ReadFile(tmpfile.Name())

						if (!filetype.IsImage(buf)) {
							logrus.Warningf("File is not an image %d", r)
						} else {
							err, publicURL = UploadToGCS(tmpfile)

							if (err != nil) {
								logrus.Warning(err)
							} else {
								success = true
							}
						}
					}
				}
			}
		}
	}

	if (success) {
		return publicURL, nil
	} else {
		return "https://jpg.cool/error.gif", errors.New("No valid image result")
	}
}

func UploadToGCS(file *os.File) (error, string) {
	ctx := context.Background()
	client, err := storage.NewClient(ctx)

	if err != nil {
		logrus.Warning(err)
		return err, ""
	}

	defer client.Close()
	bucket := client.Bucket(env.GCSBucket)

	data, err := ioutil.ReadFile(file.Name())

	if err != nil {
		logrus.Warning(err)
		return err, ""
	}

	cloudObject := bucket.Object(uuid.NewV4().String())

	wc := cloudObject.NewWriter(ctx)
	wc.Write(data)
	wc.Close()

	err = cloudObject.ACL().Set(ctx, storage.AllUsers, storage.RoleReader)

	if err != nil {
		logrus.Warning(err)
		return err, ""
	}

	attrs, err := cloudObject.Attrs(ctx)

	return nil, fmt.Sprintf("https://storage.googleapis.com/%s/%s", attrs.Bucket, attrs.Name)
}