const option = {
  piece: 9,
  col: 3,
  row: 3,
  shuffle: 100,
};

const width = 300;
const height = 300;
const pieceWidth = 100;
const pieceHeight = 100;

class Puzzle {
  constructor() {
    this.puzzleMaster = document.getElementById("puzzle-master");
    this.puzzleMasterCtx = this.puzzleMaster.getContext("2d");
    this.puzzle = document.getElementById("puzzle");
    this.puzzleCtx = this.puzzle.getContext("2d");
    this.isFinish = false;

    // 9つのピースの配列
    // 配列の順番自体は変えずにピースが持つindexを変更していく
    this.pieceData = [];

    // 0 3 6
    // 1 4 7
    // 2 5 8
    // こちらをベースにピースの移動処理などをやる
    // 横への移動時の可否を判定する
    this.currentIndexStateAsCol = {
      blank: null,
      select: null,
    };

    // 0 1 2
    // 3 4 5
    // 6 7 8
    // 縦への移動時の可否を判定する
    this.currentIndexStateAsRow = {
      blank: null,
      select: null,
    };
  }

  // タッチした位置をピース内のindexに変換し、ピースの移動が可能であれば移動する
  select(e) {
    const rect = e.target.getBoundingClientRect();
    const tx = e.clientX - rect.left;
    const ty = e.clientY - rect.top;
    // x = 0, 1, 2
    const x = Math.floor(tx / pieceWidth);
    // y = 0, 1, 2
    const y = Math.floor(ty / pieceHeight);

    if (this.checkEnableMove(x, y)) {
      this.movePiece(false);
    }
  }

  // ピースの移動が可能かを判定する
  checkEnableMove(x, y) {
    this.currentIndexStateAsCol.select = x * option.col + y;
    this.currentIndexStateAsRow.select = x + option.row * y;

    if (x < 0 || x >= option.col || y < 0 || y >= option.row) {
      return false;
    }

    // 横の移動に対する判定
    switch (this.currentIndexStateAsCol.select) {
      case this.currentIndexStateAsCol.blank + option.col:
      case this.currentIndexStateAsCol.blank - option.col:
        return true;
    }
    // 縦の移動に対する判定
    switch (this.currentIndexStateAsRow.select) {
      case this.currentIndexStateAsRow.blank - option.row:
      case this.currentIndexStateAsRow.blank + option.row:
        return true;
    }

    return false;
  }

  // ピースを動かす
  movePiece(isShuffle) {
    // ピース自体の配列インデックスを返す
    const pieceIndex = (index) => {
      for (var i = 0; i < this.pieceData.length; i++) {
        if (this.pieceData[i].index === index) {
          return i;
        }
      }
    };

    const selectPiece =
      this.pieceData[pieceIndex(this.currentIndexStateAsCol.select)];
    const blankPiece =
      this.pieceData[pieceIndex(this.currentIndexStateAsCol.blank)];

    // 選択したピースをブランクに変える
    const positionOfSelect = this.pieceData[this.currentIndexStateAsCol.select];
    this.puzzleCtx.fillStyle = "rgb(0, 0, 0)";
    this.puzzleCtx.fillRect(
      positionOfSelect.posX,
      positionOfSelect.posY,
      pieceWidth,
      pieceHeight
    );

    // ブランクだった場所に選択したピースを移動する
    const positionOfBlank = this.pieceData[this.currentIndexStateAsCol.blank];
    this.puzzleCtx.putImageData(
      selectPiece,
      positionOfBlank.posX,
      positionOfBlank.posY
    );

    // 配列で保持しているピースのindexを更新する
    selectPiece.index = this.currentIndexStateAsCol.blank;
    blankPiece.index = this.currentIndexStateAsCol.select;

    // 選択したindexをブランクのところへ入れておく
    this.currentIndexStateAsCol.blank = this.currentIndexStateAsCol.select;
    this.currentIndexStateAsCol.select = null;
    this.currentIndexStateAsRow.blank = this.currentIndexStateAsRow.select;
    this.currentIndexStateAsRow.select = null;

    // 終了判定を行い、全部のピースが元の位置に戻っていれば終了する
    if (!isShuffle && this.checkEnableEnd()) {
      setTimeout(this.end.bind(this), 500);
    }
  }

  // 全部のピースが元の位置に戻っていることを確認する
  checkEnableEnd() {
    for (var i = 0; i < this.pieceData.length; i++) {
      if (this.pieceData[i].originalIndex !== this.pieceData[i].index) {
        return false;
      }
    }
    return true;
  }

  // 終了処理
  end() {
    const lastPiece = this.pieceData[option.piece - 1];

    this.isFinish = true;
    // ピース作成時に抜いていた最後の1枚を入れる
    this.puzzleCtx.putImageData(lastPiece, lastPiece.posX, lastPiece.posY);

    alert("お疲れ様でした");
  }

  createPiece() {
    var pieceNum = 1;
    var piece;

    for (var x = 0; x < option.col; x++) {
      for (var y = 0; y < option.row; y++) {
        // マスタの画像から範囲分の画像を切り抜く
        piece = this.puzzleMasterCtx.getImageData(
          pieceWidth * x,
          pieceHeight * y,
          pieceWidth,
          pieceHeight
        );

        piece.posX = x + pieceWidth * x;
        piece.posY = y + pieceHeight * y;
        // 選択ごとに状態が変わっていくindex
        piece.index = pieceNum - 1;
        // 最後まで変わらないindex
        // indexとoriginalIndexで終了判定を行う
        piece.originalIndex = pieceNum - 1;

        // 切り抜いた画像を初期位置へ配置する
        this.puzzleCtx.putImageData(piece, piece.posX, piece.posY);
        this.pieceData.push(piece);

        pieceNum++;
      }
    }

    // ブランクの初期ポジションは左下で、その部分を黒くしておく
    this.currentIndexStateAsCol.blank = option.piece - 1;
    this.currentIndexStateAsRow.blank = option.piece - 1;
    this.puzzleCtx.fillStyle = "rgb(0, 0, 0)";
    this.puzzleCtx.fillRect(piece.posX, piece.posY, pieceWidth, pieceHeight);
  }

  // ピースの位置をランダムに変える
  shufflePiece() {
    for (var i = 0; i < option.shuffle; i++) {
      const x = Math.floor(Math.random() * option.col);
      const y = Math.floor(Math.random() * option.row);
      if (this.checkEnableMove(x, y)) {
        this.movePiece(true);
      }
    }
  }

  // 状態のリセット
  reset() {
    this.currentIndexStateAsCol.blank = null;
    this.currentIndexStateAsCol.select = null;
    this.currentIndexStateAsRow.blank = null;
    this.currentIndexStateAsRow.select = null;
    this.isFinish = false;
    this.pieceData = [];

    this.puzzleCtx.fillStyle = "rgb(0, 0, 0)";
    this.puzzleCtx.fillRect(0, 0, width, height);
    this.puzzleMasterCtx.fillStyle = "rgb(0, 0, 0)";
    this.puzzleMasterCtx.fillRect(0, 0, width, height);
  }

  // エントリーポイント
  run(src) {
    this.reset();

    this.puzzle.addEventListener("mousedown", this.select.bind(this), false);

    // 画像を読み込んでからピースを作成してシャッフルしてスタート
    const img = new Image();
    img.src = src;
    img.onload = () => {
      this.puzzleMasterCtx.drawImage(img, 0, 0, width, height);

      this.createPiece();
      this.shufflePiece();
    };
  }
}

window.onload = () => {
  const pz = new Puzzle();

  const easy = document.getElementById("easy");
  easy.addEventListener(
    "mousedown",
    (e) => {
      pz.run(easy.getAttribute("src"));
    },
    false
  );

  const hard = document.getElementById("hard");
  hard.addEventListener(
    "mousedown",
    (e) => {
      pz.run(hard.getAttribute("src"));
    },
    false
  );
};
