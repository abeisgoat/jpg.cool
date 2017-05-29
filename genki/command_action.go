package main

import "github.com/codegangsta/cli"

// CommandAction is a type which is passed to app.Commands
type CommandAction struct {
	Function func(*cli.Context, Env)
	Env      Env
}

// Perform wraps the base Function and passes a RethinkDB session and Env to it
func (ca CommandAction) Perform(c *cli.Context) {
	ca.Function(c, ca.Env)
}

