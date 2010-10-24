var TObject = function(){};
TObject.prototype = {
  position : function(x, y) {
    this.x = x;
    this.y = y;
  },

  update : function (ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    for (var y = 0; y < this.height(); y++) {
      for (var x = 0; x < this.width(); x++) {
        if (this.matrix[y][x] > 0) {
          ctx.fillRect( (x + this.x) * 20, (y + this.y) * 20, 18, 18);
        }
      }
    }
    ctx.restore();
  },

  /*
  clear : function (ctx) {
    ctx.clearRect(
      this.x * 20,
      this.y * 20,
      this.matrix[0].length * 20,
      this.matrix.length    * 20
    );
  },
  */

  height : function () {
    return this.matrix.length;
  },

  width : function () {
    return this.matrix[0].length;
  }
};

var Block = function () {};
Block.prototype = new TObject();

Block.prototype.initialize = function (x, y) {
  var data = Block.blocks[ Math.floor( Math.random() * Block.blocks.length) ];
  this.matrix = data.matrix;
  this.color  = data.color;
  this.position(x, y);
};

Block.prototype.rotate = function () {
  var rotated = [];
  for (var x = 0; x < this.width(); x++) {
    rotated[x] = [];
    for (var y = 0; y < this.height(); y++) {
      rotated[x][this.height() - y - 1] = this.matrix[y][x];
    }
  }
  return rotated;
};

Block.blocks = [
  {
    matrix : [
      [ 1, 1 ],
      [ 0, 1 ],
      [ 0, 1 ]
    ],
    color : 'orange'
  },

  {
    matrix : [
      [1, 1],
      [1, 1]
    ],
    color : 'yellow'
  },

  {
    matrix : [
      [1, 1],
      [1, 0],
      [1, 0]
    ],
    color : 'blue'
  },

  {
    matrix : [
      [1, 0],
      [1, 1],
      [1, 0]
    ],
    color : 'purple'
  },

  {
    matrix : [
      [1, 0],
      [1, 1],
      [0, 1]
    ],
    color : 'red'
  },

  {
    matrix : [
      [0, 1],
      [1, 1],
      [1, 0]
    ],
    color : 'green'
  },

  {
    matrix : [
      [1],
      [1],
      [1],
      [1]
    ],
    color : 'red'
  }
];

var Map   = function () {};
Map.prototype = new TObject();
Map.prototype.initialize = function (width, height) {
  var mapm = [];
  for (var y = 0; y < height; y++) {
    mapm[y] = [];
    for (var x = 0; x < width; x++) {
      mapm[y][x] = 0;
    }
  }
  this.matrix = mapm;
  this.position(0, 0);
  this.color = 'rgba(128, 128, 128, 0.7)';
};

Map.prototype.check = function (block, offx, offy) {
  if (offx + block.x < 0 || offy + block.y < 0 ||
      this.height() < offy + block.y + block.height() ||
      this.width()  < offx + block.x + block.width()) {
    return false;
  }

  for (var y = 0; y < block.height() ; y++) {
    for (var x = 0; x < block.width(); x++) {
      if (block.matrix[y][x] && this.matrix[y + block.y + offy][x + block.x + offx]) {
        return false;
      }
    }
  }
  
  return true;
};

Map.prototype.bindBlock = function (block) {
  for (var y = 0; y < this.height(); y++) {
    for (var x = 0; x < this.width(); x++) {
      if (block.matrix[y - block.y] && block.matrix[y - block.y][x - block.x]) {
        this.matrix[y][x]++;
      }
    }
  }
};

Map.prototype.clearRows = function () {
  for (var y = 0; y < this.height(); y++) {
    var full = true;
    for (var x = 0; x < this.width(); x++) {
      if (!this.matrix[y][x]) {
        full = false;
      }
    }
    if (full) {
      this.matrix.splice(y, 1);
      var newRow = [];
      for (var i = 0; i < this.width(); i++) {
        newRow[i] = 0;
      }
      this.matrix.unshift(newRow);
    }
  }
};

$(function() {
  var tid;
  var ctx = $('#canvas').get(0).getContext('2d');
  ctx.save();

  var map = new Map();
  map.initialize(10, 20);

  var block = new Block();
  block.initialize(0, 0);

  $('body').keydown(
    function (e) {
      switch(e.keyCode) {
       case 37:
        if (!map.check(block, -1, 0))
          return;
        block.x--;
        break;

       case 38:
        // FIXME: block.rotate() が非破壊的なせいでおかしなコードに
        var tmp = new Block();
        tmp.initialize(block.x, block.y);
        tmp.matrix = block.rotate();
        
        if (!map.check(tmp, 0, 0))
            return;
        block.matrix = tmp.matrix;
        break;
        
       case 39:
        if (!map.check(block, 1, 0))
          return;
        block.x++;
        break;

        default:
          return;
      }

      /* FIXME: not DRY */
      ctx.clearRect(0, 0, 200, 400);
      map.update(ctx);
      block.update(ctx);
    }
  );
  
  $('#start').click(
    function (e) {
      if (!tid) {
        tid = setInterval(function () {
          
          ctx.clearRect(0, 0, 200, 400);
          map.update(ctx);
          block.update(ctx);
          
          if (map.check(block, 0, 1)) {
            block.y++;
          } else {
            map.bindBlock(block);
            map.clearRows();

            block = new Block();
            block.initialize(0, 0);
          }
        }, 100);
      }
    }
  );

  $('#stop').click(
    function (e) {
      clearInterval(tid);
      tid = null;
    }
  );

  ctx.restore();
});