import React from 'react';

import './game.css';

class Cell extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    handleKeyPress = (event) => {
        console.log("hi");
        if(event.keyCode === 32){
          console.log('enter press here! ')
        }
      }

    render() {
        return (
            <div
                className={`cell ${(this.props.flagged) ? "flag" : (this.props.clicked) ? `clicked ${(this.props.value === -1) ? "mine": null}` : null}`}
                onMouseOver={this.focusDiv}
                onKeyPress={this.handleKeyPress}
                onClick={() => this.props.click(this.props.x, this.props.y)}
                onContextMenu={(e) => {
                    e.preventDefault();
                    this.props.rightClick(this.props.x, this.props.y);
                }}
                tabIndex="0"
            >
                {(!this.props.flagged && this.props.clicked) ? this.props.value : null}
            </div>
        )
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        const arr = [];
        for (let i = 0; i < 16; i++) {
            const row = [];
            for (let j = 0; j < 30; j++) {
                row.push(0);
            }
            arr.push(row);
        }
        this.state = {
            flagged: {},
            clicked: {},
            won: false,
            lost: false,
            started: false,
            mines: 99,
            board: arr,
            time: 0
        }

        this.click = this.click.bind(this);
        this.rightClick = this.rightClick.bind(this);
        this.restart = this.restart.bind(this);
    }

    restart() {
        const arr = [];
        for (let i = 0; i < 16; i++) {
            const row = [];
            for (let j = 0; j < 30; j++) {
                row.push(0);
            }
            arr.push(row);
        }
        clearInterval(this.myInterval);
        this.setState({
            flagged: {},
            clicked: {},
            won: false,
            lost: false,
            started: false,
            mines: 99,
            startMines: 99,
            board: arr,
            time: 0
        })
    }

    start(x, y) {
        const newBoard = [...this.state.board];
        const totalSpots = newBoard.length * newBoard[0].length;
        const currSpot = y * newBoard[0].length + x;
        const spots = [];

        const border = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]];

        for (let i = 0; i < totalSpots; i++) {
            spots.push(i);
        }

        // for (let j = 0; j < border.length; j++) {
        //     const curr = border[j];
        //     const xBorder = x + curr[0];
        //     const yBorder = y + curr[1];
        //     if (xBorder >= 0 && xBorder < newBoard[0].length && yBorder >= 0 && yBorder < newBoard.length && newBoard[yBorder][xBorder] !== -1) {
        //         newBoard[yBorder][xBorder]++;
        //     }
        // }

        spots[currSpot] = spots[spots.length - 1];
        for (let i = 0; i < border.length; i++) {
            const curr = border[i];
                const xBorder = x + curr[0];
                const yBorder = y + curr[1];
                if (xBorder >= 0 && xBorder < newBoard[0].length && yBorder >= 0 && yBorder < newBoard.length) {
                    const spot = yBorder * newBoard[0].length + xBorder;
                    spots[spot] = spots[spots.length - (i+2)];
                }
        }
        for (let i = 0; i <= border.length; i++) {
            spots.pop();
        }
        const clicks = {};

        for (let i = 0; i < this.state.mines; i++) {
            const randVal = Math.floor(Math.random() * spots.length);
            const spot = spots[randVal];
            spots[randVal] = spots[spots.length - 1];
            spots.pop();
            const y = Math.floor(spot / newBoard[0].length);
            const x = spot % newBoard[0].length;
            newBoard[y][x] = -1;

            for (let j = 0; j < border.length; j++) {
                const curr = border[j];
                const xBorder = x + curr[0];
                const yBorder = y + curr[1];
                if (xBorder >= 0 && xBorder < newBoard[0].length && yBorder >= 0 && yBorder < newBoard.length && newBoard[yBorder][xBorder] !== -1) {
                    newBoard[yBorder][xBorder]++;
                }
            }
        }

        this.recurse(x, y, newBoard, clicks);

        this.myInterval = setInterval(() => {this.setState({time: this.state.time + 1})}, 1000);

        this.setState({
            board: newBoard,
            started: true,
            clicked: clicks,
        });
    }

    click(x, y) {
        if (this.state.started === false) {
            this.start(x, y);
            return;
        } else {
            const board = this.state.board;
            const clicks = { ...this.state.clicked}
            this.recurse(x, y, board, clicks);

            this.setState({
                clicked: clicks
            })
        }

    }

    recurse(x, y, board, clicks) {
        const curr = board[y][x];
        const spot = y * board[0].length + x;
        const flags = this.state.flagged;
        if (flags.hasOwnProperty(spot) || clicks.hasOwnProperty(spot)) {
            return;
        } else if (curr === -1) {
            this.endGame();
            return;
        }
        clicks[spot] = 1;
        if (Object.keys(clicks).length === board.length * board[0].length - this.state.startMines) {
            this.win();
        }
        if (board[y][x] === 0) {
            const border = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]];
            for (let j = 0; j < border.length; j++) {
                const curr = border[j];
                const xBorder = x + curr[0];
                const yBorder = y + curr[1];
                if (xBorder >= 0 && xBorder < board[0].length && yBorder >= 0 && yBorder < board.length) {
                    this.recurse(xBorder, yBorder, board, clicks);
                }
            }
        }
        

    }

    win() {
        clearInterval(this.myInterval);
        this.setState({
            won: true
        })
    }

    endGame() {
        clearInterval(this.myInterval);
        this.setState({
            lost: true,
        });
    }

    rightClick(x, y) {
        const board = this.state.board;
        const spot = y * board[0].length + x;
        const clicks = this.state.clicked;
        const flags = { ...this.state.flagged };
        let newMines = this.state.mines;
        if (clicks.hasOwnProperty(spot)) {
            return;
        } else if (flags.hasOwnProperty(spot)) {
            delete flags[spot];
            newMines++;
        } else {
            flags[spot] = 1;
            newMines--;
        }
        this.setState({
            flagged: flags,
            mines: newMines
        });
    }

    render() {
        const clicks = this.state.clicked;
        const flags = this.state.flagged;
        const board = this.state.board;
        if (this.state.lost) {
            return (
                <div id="game">
                    <div id="top">
                        <div id="clock">
                            <span>{this.state.time}</span>
                        </div>
                        <div id="reset">
                            <button onClick={this.restart}>Reset</button>
                        </div>
                        <div id="mines">
                            <span>{this.state.mines}</span>
                        </div>
                    </div>
                    {board.map((row, y) => (<div className="row" key={y}>
                        {row.map((cell, x) => (
                            <Cell
                                value={cell}
                                clicked={true}
                                flagged={flags.hasOwnProperty(y * board[0].length + x)}
                                x={x}
                                y={y}
                                key={y * board[0].length + x}
                                click={this.click}
                                rightClick={this.rightClick}
                            />))}
                    </div>))}
                </div>
    
    
            );
        }
        return (
            <div id="game">
                <div id="top">
                        <div id="clock">
                            <span>{this.state.time}</span>
                        </div>
                        <div id="reset">
                            <button onClick={this.restart}>Reset</button>
                        </div>
                        <div id="mines">
                            <span>{this.state.mines}</span>
                        </div>
                    </div>
                {board.map((row, y) => (<div className="row" key={y}>
                    {row.map((cell, x) => (
                        <Cell
                            value={cell}
                            clicked={clicks.hasOwnProperty(y * board[0].length + x)}
                            flagged={flags.hasOwnProperty(y * board[0].length + x)}
                            x={x}
                            y={y}
                            key={y * board[0].length + x}
                            click={this.click}
                            rightClick={this.rightClick}
                        />))}
                </div>))}
            </div>


        );
    }


}

export default Game;
