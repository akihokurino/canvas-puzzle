var puzzleMaster;
var puzzle;

var puzzleMasterCtx;
var puzzleCtx;

var option = {
  piece: 9,
  col: 3,
  row: 3,
  shuffle: 100,
};

var width = 300;
var height = 300;

var pieceWidth = 100;
var pieceHeight = 100;

var pieceData = [];

var pieceIndex = {
  blank: null,
  click: null,
};

var pieceIndex2 = {
  blank: null,
  click: null,
};

var start = false;
var finish = false;

window.onload = function () {
  init();
};

/*----------初期処理----------*/

function init() {
  puzzleMaster = document.getElementById("puzzleMaster");
  puzzle = document.getElementById("puzzle");

  puzzleMasterCtx = puzzleMaster.getContext("2d");
  puzzleCtx = puzzle.getContext("2d");

  puzzleCtx.fillStyle = "rgb(0, 0, 0)";
  puzzleCtx.fillRect(0, 0, width, height);
  puzzleMasterCtx.fillStyle = "rgb(0, 0, 0)";
  puzzleMasterCtx.fillRect(0, 0, width, height);

  //タッチ時処理
  puzzle.addEventListener("mousedown", mouseDown, false);

  gameStart("sample1.png");
}

/*----------mouseDown関数----------*/

function mouseDown(e) {
  var rect = e.target.getBoundingClientRect();

  var mouseX = e.clientX - rect.left;
  var mouseY = e.clientY - rect.top;

  var clickX = Math.floor((mouseX - 1) / pieceWidth);
  var clickY = Math.floor((mouseY - 1) / pieceHeight);

  console.log("clickX: " + clickX);
  console.log("clickY: " + clickY);

  //クリックしたピースが移動可能なら移動
  if (checkMove(clickX, clickY)) {
    movePiece();
  }
}

/*----------gameStart関数----------*/

function gameStart(src) {
  resetPuzzle(true);
  loadImg(true, src);
}

/*----------resetPuzzle関数----------*/

function resetPuzzle(resetFlag) {
  if (resetFlag) {
    pieceIndex.blank = null;
    pieceIndex.click = null;

    start = true;
    finish = false;

    //ピース画像の初期化
    pieceData = [];
  }

  //画面の再描画
  puzzleCtx.fillStyle = "rgb(0, 0, 0)";
  puzzleCtx.fillRect(0, 0, width + 4, height + 4);

  puzzleMasterCtx.fillStyle = "rgb(0, 0, 0)";
  puzzleMasterCtx.fillRect(0, 0, width + 4, height + 4);
}

/*----------loadImg関数----------*/

function loadImg(shuffle, src) {
  //イメージオブジェクトの生成
  var img = new Image();
  img.src = src;

  img.onload = function () {
    //マスター画像の描画処理
    puzzleMasterCtx.drawImage(img, 0, 0, width, height);

    //画像ピース化処理
    createPiece();

    if (shuffle) {
      shufflePiece();
    }
  };
}

/*----------createPiece関数----------*/

function createPiece() {
  var pieceNum = 1;
  var piece;

  for (var x = 0; x < option.col; x++) {
    for (var y = 0; y < option.row; y++) {
      //マスター画像から9枚の画像をトリミングする
      piece = puzzleMasterCtx.getImageData(
        pieceWidth * x,
        pieceHeight * y,
        pieceWidth,
        pieceHeight
      );

      //座標格納（隙間に1px空ける)
      piece.posX = 1 + x + pieceWidth * x;
      piece.posY = 1 + y + pieceHeight * y;

      piece.index = pieceNum - 1;
      piece.number = pieceNum;

      //トリミングした画像を上のレイヤーのキャンバスに配置
      puzzleCtx.putImageData(piece, piece.posX, piece.posY);

      //ピースを保存
      pieceData.push(piece);

      pieceNum++;
    }
  }

  if (!finish) {
    //ブランク初期設定（最後のピース）
    pieceIndex.blank = option.piece - 1;
    pieceIndex2.blank = option.piece - 1;

    //最後のピースを削除する
    puzzleCtx.fillStyle = "rgb(0, 0, 0)";
    puzzleCtx.fillRect(piece.posX, piece.posY, pieceWidth, pieceHeight);
  }
}

/*----------shufflePiece関数----------*/

function shufflePiece() {
  for (var i = 0; i < option.shuffle; i++) {
    //ランダムにクリック座標を取得
    var _clickX = Math.floor(Math.random() * option.col);
    var _clickY = Math.floor(Math.random() * option.row);

    //クリックしたピースが移動可能なら移動
    if (checkMove(_clickX, _clickY)) {
      movePiece("shuffle");
    }
  }
}

/*----------checkMove関数----------*/

function checkMove(x, y) {
  console.log("x: " + x);
  console.log("y: " + y);
  //クリックしたピースのindex値を取得
  pieceIndex.click = x * option.col + y;
  pieceIndex2.click = x + option.row * y;

  //キャンバス外のクリックは無効
  if (x < 0 || x >= option.col) {
    return false;
  }

  if (y < 0 || y >= option.row) {
    return false;
  }

  //ピースが移動できるかの判定処理
  switch (pieceIndex.click) {
    //クリックしたピースの左にブランクがある場合
    case pieceIndex.blank + option.col:
      return true;
    //クリックしたピースの右にブランクがある場合
    case pieceIndex.blank - option.col:
      return true;
  }

  switch (pieceIndex2.click) {
    //クリックしたピースの下にブランクがある場合
    case pieceIndex2.blank - option.row:
      return true;
    //クリックしたピースの上にブランクがある場合
    case pieceIndex2.blank + option.row:
      return true;
  }

  return false;
}

/*----------movePiece関数----------*/

function movePiece(mode) {
  var clickIndex = getPieceIndex(pieceIndex.click);
  var blankIndex = getPieceIndex(pieceIndex.blank);

  //クリックしたピースのデータを取得
  var clickPiece = pieceData[pieceIndex.click];

  //現在のブランクピースのデータを取得
  var blankPiece = pieceData[pieceIndex.blank];

  //クリックした位置のピースを黒で塗りつぶす
  puzzleCtx.fillStyle = "rgb(0, 0, 0)";
  puzzleCtx.fillRect(
    clickPiece.posX - 1,
    clickPiece.posY - 1,
    pieceWidth + 2,
    pieceHeight + 2
  );

  //現在ブランクになっている位置にクリックしたピースの画像を配置する
  puzzleCtx.putImageData(
    pieceData[clickIndex],
    blankPiece.posX,
    blankPiece.posY
  );

  //index入れ替え処理
  pieceData[clickIndex].index = [
    pieceIndex.blank,
    (pieceData[blankIndex].index = pieceIndex.click),
  ][0];

  //blank入れ替え処理
  pieceIndex.blank = [pieceIndex.click, (pieceIndex.click = null)][0];
  pieceIndex2.blank = [pieceIndex2.click, (pieceIndex2.click = null)][0];

  //ゲーム終了判定（シャッフルの時には適応しない）
  if (mode == "" && checkEnd) {
    setTimeout(gameEnd, 1000);
  }
}

/*----------getPieceIndex関数----------*/

function getPieceIndex(num) {
  for (var i = 0; i < pieceData.length; i++) {
    if (pieceData[i].index === num) {
      return i;
    }
  }
}

/*----------checkEnd関数----------*/

function checkEnd() {
  var endFlag = true;

  //画像が元の位置にもどっているかどうかをチェック
  for (var i = 0; i < pieceData.length; i++) {
    if (pieceData[i].number !== pieceData[i].index + 1) {
      endFlag = false;
      break;
    }
  }

  return endFlag;
}

/*----------gameEnd関数----------*/

function gameEnd() {
  var lastPiece = pieceData[option.piece - 1];

  finish = true;

  puzzleCtx.putImageData(lastPiece, lastPiece.posX, lastPiece.posY);
}
