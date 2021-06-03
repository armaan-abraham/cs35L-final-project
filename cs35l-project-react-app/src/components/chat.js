import React from 'react';
import { auth } from '../firebase';
import db from '../firebase';
import { firebase } from '../firebase';

// When chat button pressed, pull up this room
// Will have a user already signed in or asked to sign in, and another user
// If user ID is same as current user ID, that's the same person
// Else, create a chat room with current user and profile of user clicked on
// Will have two user IDs, current user sends message to other user.

class Chat extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: firebase.auth().currentUser,
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
            db.ref("chats").orderByChild().on("value", snapshot => {
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
            await db.ref("chats").chatId.messages.push({
                content: this.state.content,
                timestamp: Date.now(),
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
                        return <p key={chat.timestamp}>{chat.content}</p>
                    })}
                </div>

                <form onSubmit={this.handleSubmit}>
                    <input onChange={this.handleChange} value={this.state.content}></input>
                    {this.state.error ? <p>{this.state.writeError}</p> : null}
                    <button type="submit">send</button>
                </form>

                <div>
                    Logged in as: <strong>{this.state.user.uid}</strong>
                </div>
            </div>
        );
    }
}

export default Chat;