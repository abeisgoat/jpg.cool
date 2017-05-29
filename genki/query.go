package main

type GenkiRequest struct {
	Phrase     string      `json:"phrase"`
	Query      string      `json:"query"`
	Parameters interface{} `json:"parameters"`
}

// {"value":{"url":"http://i.imgur.com/pqKKZqw.png"}}
type GenkiResponse struct {
	Value struct {
		URL string `json:"url"`
	} `json:"value"`
}