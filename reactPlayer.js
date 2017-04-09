/*
porgressBar
vol
 */

var getloggerproto = function (text) {
    var log = false;

    return function (text) {
        if (!log) {
            log = document.createElement("div");
            log.setAttribute("id", "logger")
            document.getElementsByClassName("container")[0].appendChild(log)
        }
        log.innerText = text;
        setTimeout(function () {
            log.setAttribute("class", "show")
        }, 1000);
        setTimeout(function () {
            log.setAttribute("class", "hide")
        }, 2000);
    }
}
var logger = getloggerproto();
var songList = [{
    name: 'plus.mp3',
    src: "./img/src111.mp3"
},
{
    name: "the phoenix.mp3",
    src: "./img/src222.mp3"
},
{
    name: "little lucky.mp3",
    src: "./img/src333.mp3"
}];
function changeTime(time) {
    var min = 0, sec = 0;
    min = Math.floor(time / 60);
    sec = Math.floor(time % 60);
    if (sec < 10) {
        sec = '0' + sec;
    }
    return min + ':' + sec;
}
var isSingleHandle = true;
var timer = null;
var Player = React.createClass({

    getInitialState: function () {
        return {
            currentTrackLen: songList.length,
            currentTrackIndex: 0,
            playStatus: false,
            isSingle: true
        }
    },
    componentDidMount: function () {
        this.refresh();
        this.bindEnd();

    },

    bindEnd: function () {
        document.getElementsByTagName("body")[0].addEventListener("ended", function (e) {
            if (!isSingleHandle) {
                document.getElementsByClassName("next")[0].click();
            }
            document.getElementById("audio").play();
        }, true)
        document.getElementsByTagName("body")[0].addEventListener("canplay", function (e) {
            clearInterval(timer);
            console.log(timer);
            var now = 0,
                duration = e.target.duration,
                audio = e.target,
                progressBar = document.getElementsByClassName("progressBar")[0],
                ct = document.getElementsByClassName("ct")[0],
                tt = document.getElementsByClassName("tt")[0];
            tt.innerText = changeTime(duration);
            timer = setInterval(function () {
                ct.innerText = changeTime(audio.currentTime);
                var percent = Math.floor((audio.currentTime * 100 / duration));
                console.log(percent);
                progressBar.style.width = percent + '%';
            }, 1000)
        }, true)
    },
    getInfo: function () {
        var index = this.state.currentTrackIndex;
        var url = songList[index].src;
        var xhr = new XMLHttpRequest();
        xhr.responseType = "arraybuffer";
        xhr.open("get", url, true);
        xhr.onload = function (e) {
            showMetaData(e.target.response);
        }
        xhr.send();
        function showMetaData(data) {
            musicmetadata(data, function (err, result) {
                if (err) throw err;
                document.getElementsByClassName("artist")[0].innerText = result.artist[0];
                if (result.picture.length > 0) {
                    var picture = result.picture[0];
                    var url = URL.createObjectURL(new Blob([picture.data], { 'type': 'image/' + picture.format }));
                    var image = document.getElementsByClassName('cover')[0];
                    var blurBg = document.getElementsByClassName('blurBg')[0];
                    blurBg.src = url;
                    image.style.backgroundImage = "url(" + url + ')';
                    var songName = songList[index].name.substring(0, songList[index].name.length - 4)
                    document.getElementsByClassName("title")[0].innerText = songName;
                }
            });
        }
    },
    refresh: function (modle) {

        var nextindex = this.state.currentTrackIndex;
        if (modle) {
            if (modle == 'pre') {
                logger("←");
                nextindex = ((this.state.currentTrackIndex + songList.length) - 1) % songList.length;
            } else if (modle == 'next') {
                logger("→");
                nextindex = (this.state.currentTrackIndex + 1) % songList.length;
            }
        }
        this.state.currentTrackIndex = nextindex;

        this.refs.audio.innerHTML = '';
        this.refs.audio.innerHTML = '<audio id="audio"><source src=' + songList[nextindex].src + ' type="audio/mpeg"></source></audio>'
        var audio = document.getElementById('audio');
        if (this.state.playStatus) {
            audio.play();
        } else {
            audio.pause();
        }
        this.getInfo();
    },
    playOrStop: function () {
        var audio = document.getElementById('audio');
        if (this.state.playStatus) {
            audio.pause();
        } else {
            audio.play();
        }

        this.state.playStatus = !this.state.playStatus;
        if (this.state.playStatus) {
            logger("play");
        } else {
            logger("pause");
        }
    },
    singleOrLoop: function () {
        this.state.isSingle = !this.state.isSingle;
        isSingleHandle = this.state.isSingle;
        if (isSingleHandle) {
            logger("singleLoop");
        } else {
            logger("listLoop");
        }
    },
    render: function () {
        return <div className='container'>
            <div>
                <div className='cover'></div>
                <img className='blurBg'></img>
                <p className='title'></p>
                <div className='artist'></div>
                <div className='progressCon'><div className='progressBar'></div></div>
                <p className="timeCon"><span className="ct"></span><span className="tt"></span></p>
            </div>
            <div ref="audio">
                <audio id="audio" controls='controls'>
                </audio></div>
            <ul>
                <li onClick={(pre) => { this.refresh('pre') }}>←</li>
                <li onClick={this.playOrStop}>P&S</li>
                <li className='next' onClick={(next) => { this.refresh('next') }}>→</li>
                <li className='sol' onClick={this.singleOrLoop}>Single or Loop</li>
            </ul>
        </div>
    },

});
ReactDOM.render(<Player />, document.getElementById('example'));
