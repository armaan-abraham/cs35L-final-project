import React from 'react';
import { auth } from '../firebase';
import db from '../firebase';
import { firebase } from '../firebase';

// When chat button pressed, pull up this room
// Used as global forum for authenticated users to communicate
// This code is modeled after Deven Rathore tutorial:
// https://css-tricks.com/building-a-real-time-chat-app-with-react-and-firebase/

class Chat extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: firebase.auth().currentUser,
            content: '',
            chats: [],
            readError: null,
            writeError: null
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async componentDidMount() {
        this.setState({ readError: null });
        try {
            db.ref("chats").on("value", snapshot => {
                let chats = [];
                snapshot.forEach((snap) => {
                    chats.push(snap.val());
                });
                
                this.setState({ chats });
            });
        } catch (error) {
            this.setState({ readError: error.message });
        }
    }

    handleChange(event) {
        this.setState({
            content: event.target.value
        });
    }

    async handleSubmit(event) {
        event.preventDefault();
        this.setState({ writeError: null });
        try {
            await db.ref("chats").push({
                content: this.state.content,
                time: Date.now(),
                uid: this.state.user.uid
            });
            this.setState({ content: '' });
        } catch (error) {
            this.setState({ writeError: error.message });
        }
    }

    render() {
        return (
            <div>
                <div className="chats">
                    {this.state.chats.map(chat => {
                        return <p key={chat.time}>{chat.content}</p>
                    })}
                </div>

                <form onSubmit={this.handleSubmit}>
                    <input onChange={this.handleChange} value={this.state.content}></input>
                    {this.state.error ? <p>{this.state.writeError}</p> : null}
                    <button type="submit">send</button>
                </form>

                <div>
                    Logged in as: <p>{this.state.user.uid}</p>
                </div>
            </div>
        );
    }
}

export default Chat;