import * as React from "react";
import ChallengesApiClient from "../services/ChallengesApiClient";
import LastAttemptsComponent from "./LastAttemptsComponent";
import LeaderBoardComponent from "./LeaderBoardComponent";

class ChallengeComponent extends React.Component {

    constructor ( props ) {
        super ( props );
        this.state = {
            a: "", b: "",
            user: "",
            message: "",
            guess: 0,
            lastAttempts: []
        };
        this.handleSubmitResult = this.handleSubmitResult.bind ( this );
        this.handleChange = this.handleChange.bind ( this );
    }

    componentDidMount (): void {
        this.refreshChallenge ();
    }

    refreshChallenge () {
        ChallengesApiClient.challenge ().then (
            res => {
                if ( res.ok ) {
                    res.json ().then ( json => {
                        this.setState ( {
                            a: json.factorA,
                            b: json.factorB
                        } );
                    } );
                } else {
                    this.updateMessage ( "Can't reach the server" );
                }
            }
        );
    }

    handleChange ( event ) {
        const name = event.target.name;
        this.setState ( {
            [name]: event.target.value
        } );
    }

    handleSubmitResult ( event ) {
        event.preventDefault ();
        ChallengesApiClient.sendGuess ( this.state.user,
            this.state.a, this.state.b,
            this.state.guess )
            .then ( res => {
                if ( res.ok ) {
                    res.json ().then ( json => {
                        if ( json.correct ) {
                            this.updateMessage ( "Congratulations! Your guess is correct" );
                        } else {
                            this.updateMessage ( "Oops! Your guess " + json.resultAttempt +
                                " is wrong, but keep playing!" );
                        }
                        this.updateLastAttempts ( this.state.user );
                        this.refreshChallenge ();
                        this.setState ( { guess: 0 } );
                    } );
                } else {
                    this.updateMessage ( "Error: server error or not available" );
                }
            } );
    }

    updateMessage ( m: string ) {
        this.setState ( {
            message: m
        } );
    }

    updateLastAttempts ( userAlias: string ) {
        ChallengesApiClient.getAttempts ( userAlias ).then ( res => {
            if ( res.ok ) {
                let attempts: Attempt[] = [];
                res.json ().then ( data => {
                    data.forEach ( item => {
                        attempts.push ( item );
                    } );
                    this.setState ( {
                        lastAttempts: attempts
                    } );
                } );
            }
        } );
    }

    render () {
        return (
            <div className="container">
                <div className="container display-column mt-3">
                    <h3>Your new challenge is</h3>
                    <div className="challenge">
                        { this.state.a } x { this.state.b }
                    </div>
                </div>
                <div className="container mt-3">
                    <form onSubmit={ this.handleSubmitResult }>
                        <div className="form-floating mb-3 mw-100">
                            <input type="text" className="form-control" name="user" id="user" minLength="1"
                                   maxLength="12"
                                   placeholder="Your alias" value={ this.state.user } onChange={ this.handleChange }
                                   required/>
                            <label htmlFor="user">Your alias</label>
                        </div>
                        <div className="form-floating mb-3 mw-100">
                            <input type="number" className="form-control" id="guess" min="0" placeholder="Your guess"
                                   name="guess"
                                   value={ this.state.guess !== 0 ? this.state.guess : "" }
                                   onChange={ this.handleChange } required/>
                            <label htmlFor="guess">Your guess</label>
                        </div>
                        <input className="btn btn-primary btn-lg" type="submit" value="submit"/>
                    </form>
                </div>
                <div>
                    <h4 className="container display-column mt-3 mw-100">{ this.state.message }</h4>
                    { this.state.lastAttempts.length > 0 &&
                        <LastAttemptsComponent lastAttempts={ this.state.lastAttempts }/>
                    }
                </div>
                <LeaderBoardComponent/>
            </div>
        );
    }
}

export default ChallengeComponent;
