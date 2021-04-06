let eles = [] // 图片数组信息
const maskCanvas = wx.createCanvasContext('maskCanvas', this) // 创建 canvas 的绘图上下文 CanvasContext 对象

Page({
  data: {
    eleId: 1, // 元素id，用于识别点击图片
    eleList: [], //元素集合
    winWidth: 0, //手机宽度
    winHeight: 0, //手机高度
    bgImg: 'http://pic.51yuansu.com/backgd/cover/00/56/79/5d7e4b3e7d537.jpg', //背景图
    bgWidth: 0, //背景宽度
    bgHeight: 0, //背景高度
    isText: false,
    text: "",
    isModify: "",
    isPoster: false,
    poster: ""
  },

  onLoad: function (options) {
    eles = this.data.eleList
    this.getBgInfo(this.data.bgImg)
  },

  //获取海报背景图信息
  getBgInfo(url) {
    wx.downloadFile({
      url: url,
      success: res => {
        this.setData({
          bgImg: res.tempFilePath
        })
      }
    })
    wx.getImageInfo({
      src: url,
      success: res => {
        this.setData({
          bgWidth: res.width, //海报图片原始宽度
          bgHeight: res.height, //海报图片原始高度
        })
      }
    })
    wx.getSystemInfo({
      success: res => {
        let w = res.windowWidth
        let h = res.windowHeight
        this.setData({
          winWidth: w - 45,
          winHeight: h / (w / (w - 45)),
        })
        this.setData({
          canvasWidth: this.data.winWidth,
          canvasHeight: this.data.winHeight
        })
      }
    })
  },

  // 上传图片
  uploadImg() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.getImgInfo(res.tempFilePaths[0])
      }
    })
  },

  // 设置图片的信息
  getImgInfo(url) {
    let data = {} // 存储图片信息
    wx.getImageInfo({
      src: url,
      success: res => {
        // 初始化数据
        let w = res.width
        let h = res.height
        data.type = "img"
        data.width = 100 //初始图片宽度100
        data.height = h / (w / 100) //按比例缩放
        data.image = url // 显示地址
        data.top = 0 // top定位
        data.left = 0 // left定位
        // 圆心坐标
        data.x = data.left + data.width / 2
        data.y = data.top + data.height / 2
        data.scale = 1 // scale缩放
        data.rotate = 1 // 旋转角度
        data.oScale = 1 //方向缩放
        data.angle = 0 //旋转角度，不定义的话，真机不旋转就不会出现
        data.active = true // 选中状态
        eles.push(data) //数组新增数据
        this.setData({
          eleList: eles
        })
      }
    })
  },

  // 添加文字
  uploadText() {
    if (!this.data.text) {
      return
    }
    if (this.data.isModify) {
      eles[this.data.isModify].text = this.data.text
      this.setData({
        eleList: eles,
        text: "",
        isText: false
      })
      return
    }
    let data = {} // 存储文字信息
    // 初始化数据
    data.type = "text"
    data.width = 240 //初始文字宽度
    data.height = 20 //初始文字高度
    data.text = this.data.text // 显示地址
    data.top = 0 // top定位
    data.left = 0 // left定位
    // 圆心坐标
    data.x = data.left + data.width / 2
    data.y = data.top + data.height / 2
    data.scale = 1 // scale缩放
    data.rotate = 1 // 旋转角度
    data.oScale = 1 //方向缩放
    data.angle = 0 //旋转角度，不定义的话，真机不旋转就不会出现
    data.active = true // 选中状态
    eles.push(data) //数组新增数据
    this.setData({
      eleList: eles,
      text: "",
      isText: false
    })
  },

  inputText(e) {
    this.setData({
      text: e.detail.value
    })
  },

  changeText() {
    this.setData({
      isText: !this.data.isText,
      isModify: ""
    })
  },

  modifyText(e) {
    let index = e.currentTarget.dataset.index
    this.setData({
      isModify: index.toString(),
      isText: true,
      text: eles[index].text
    })
  },

  //点击海报区域去掉图标上的框
  closeAct() {
    for (let i in eles) {
      eles[i].active = false
    }
    this.setData({
      eleList: eles
    })
  },

  // 点击图片
  wrapTouchStart: function (e) {
    let index = e.currentTarget.dataset.index
    // 循环图片数组获取点击的图片信息
    for (let i in eles) {
      eles[i].active = false
    }
    eles[index].active = true
    this.setData({
      eleList: eles
    })
    // 获取点击的坐标值
    eles[index].lx = e.touches[0].clientX
    eles[index].ly = e.touches[0].clientY
  },

  // 拖动图片
  wrapTouchMove(e) {
    let index = e.currentTarget.dataset.index
    eles[index]._lx = e.touches[0].clientX
    eles[index]._ly = e.touches[0].clientY

    eles[index].left += eles[index]._lx - eles[index].lx
    eles[index].top += eles[index]._ly - eles[index].ly
    eles[index].x += eles[index]._lx - eles[index].lx
    eles[index].y += eles[index]._ly - eles[index].ly

    eles[index].lx = e.touches[0].clientX
    eles[index].ly = e.touches[0].clientY

    this.setData({
      eleList: eles
    })
  },

  // 点击伸缩图标
  oTouchStart(e) {
    let index = e.currentTarget.dataset.index
    //找到点击的那个图片对象，并记录
    for (let i in eles) {
      eles[i].active = false
    }
    eles[index].active = true
    //获取作为移动前角度的坐标
    eles[index].tx = e.touches[0].clientX
    eles[index].ty = e.touches[0].clientY
    //移动前的角度
    eles[index].anglePre = this.countDeg(eles[index].x, eles[index].y, eles[index].tx, eles[index].ty)
    //获取图片半径
    eles[index].r = this.getDistancs(eles[index].x, eles[index].y, eles[index].left, eles[index].top)
  },

  oTouchMove: function (e) {
    let index = e.currentTarget.dataset.index
    //记录移动后的位置
    eles[index]._tx = e.touches[0].clientX
    eles[index]._ty = e.touches[0].clientY
    //移动的点到圆心的距离
    eles[index].disPtoO = this.getDistancs(eles[index].x, eles[index].y, eles[index]._tx, eles[index]._ty - 10)

    eles[index].scale = eles[index].disPtoO / eles[index].r
    eles[index].oScale = 1 / eles[index].scale

    //移动后位置的角度
    eles[index].angleNext = this.countDeg(eles[index].x, eles[index].y, eles[index]._tx, eles[index]._ty)
    //角度差
    eles[index].new_rotate = eles[index].angleNext - eles[index].anglePre

    //叠加的角度差
    eles[index].rotate += eles[index].new_rotate
    eles[index].angle = eles[index].rotate //赋值

    //用过移动后的坐标赋值为移动前坐标
    eles[index].tx = e.touches[0].clientX
    eles[index].ty = e.touches[0].clientY
    eles[index].anglePre = this.countDeg(eles[index].x, eles[index].y, eles[index].tx, eles[index].ty)

    //赋值setData渲染
    this.setData({
      eleList: eles
    })
  },

  // 计算坐标点到圆心的距离
  getDistancs(cx, cy, pointer_x, pointer_y) {
    var ox = pointer_x - cx
    var oy = pointer_y - cy
    return Math.sqrt(
      ox * ox + oy * oy
    )
  },

  /*
   *参数cx和cy为图片圆心坐标
   *参数pointer_x和pointer_y为手点击的坐标
   *返回值为手点击的坐标到圆心的角度
   */
  countDeg: function (cx, cy, pointer_x, pointer_y) {
    var ox = pointer_x - cx
    var oy = pointer_y - cy
    var to = Math.abs(ox / oy)
    var angle = Math.atan(to) / (2 * Math.PI) * 360
    if (ox < 0 && oy < 0) //相对在左上角，第四象限，js中坐标系是从左上角开始的，这里的象限是正常坐标系  
    {
      angle = -angle
    } else if (ox <= 0 && oy >= 0) //左下角,3象限  
    {
      angle = -(180 - angle)
    } else if (ox > 0 && oy < 0) //右上角，1象限  
    {
      angle = angle
    } else if (ox > 0 && oy > 0) //右下角，2象限  
    {
      angle = 180 - angle
    }
    return angle
  },

  // 删除元素
  deleteEle(e) {
    let index = e.currentTarget.dataset.index
    let list = this.data.eleList
    list.splice(index, 1)
    eles = list
    this.setData({
      eleList: list
    })
  },

  // 打开遮罩层
  showPoster() {
    this.mixImg()
    this.setData({
      isPoster: true
    })
  },

  // 关闭遮罩层
  closePoster() {
    this.setData({
      isPoster: false
    })
  },

  // 合成图片
  mixImg() {
    let {
      bgImg,
      bgWidth,
      bgHeight,
      canvasWidth,
      canvasHeight
    } = this.data
    maskCanvas.save()
    maskCanvas.beginPath()
    maskCanvas.setFillStyle('#fff')
    maskCanvas.fillRect(0, 0, canvasWidth, canvasHeight)
    maskCanvas.drawImage(bgImg, 0, 0, bgWidth, bgHeight, 0, 0, canvasWidth, canvasHeight)
    eles.forEach((item, index) => {
      maskCanvas.save()
      maskCanvas.beginPath()
      maskCanvas.translate(0, 0)
      maskCanvas.translate(item.x, item.y) // 圆心坐标
      maskCanvas.rotate(item.angle * Math.PI / 180)
      maskCanvas.translate(-(item.width * item.scale / 2), -(item.height * item.scale / 2))
      if (item.type == 'img') {
        maskCanvas.drawImage(item.image, 0, 0, item.width * item.scale, item.height * item.scale)
      } else {
        maskCanvas.setFontSize(18)
        maskCanvas.setFillStyle('#fff')
        maskCanvas.fillText(item.text, 1, item.height)
      }
      maskCanvas.restore()
    })
    maskCanvas.draw(false, (e) => {
      wx.canvasToTempFilePath({
        canvasId: 'maskCanvas',
        success: res => {
          this.setData({
            poster: res.tempFilePath
          })
        }
      }, this)
    })
  },

  // 保存图片到系统相册
  saveImg() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.poster,
      success: () => {
        this.closePoster()
      }
    })
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.writePhotosAlbum'] == false) {
          wx.openSetting()
        }
      }
    })
  }
})