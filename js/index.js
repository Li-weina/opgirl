var url = window.location.href;
var homeReg = /home/;
var channelReg = /channel/;
var labelReg = /label/;
var detailReg = /detail/;
var searchReg = /search/;
var subjectReg = /subject/;
var subListReg = /subList/;
// var homeBid;
var opGirlFn = {
    //首页的初始化
    homeInit: function () {
        var $selList = $('.sel-list-inner'),
            total = 0,
            page = 0,
            homeBid = 0,
            bid = 0,
            self = this;
        this.channelList();
        this.banner();
        this.homeRequest(function (data) {
            var chData = data.channels;
            bid = data.recommend.id;
            var listStr = '';
            if (chData.length > 0) {
                $(chData).each(function (index, item) {
                    listStr += '<a href="channel.html?id=' + item.id + '">' + $(this)[0].name + '</a>';
                });
                listStr += '<a href="search.html">搜索</a>';
                $('.ch-list').html(listStr);
            }
            var $newAry = $(chData).splice(0, 4),
                str = '';
            if ($newAry.length > 0) {
                $.each($newAry, function (index, item) {
                    str += '<a class="sel-pics" href="channel.html?id=' + item.id + '">'
                        + '<img class="sel-pic" src="http://image.spider.oupeng.com/' + item.checksum + '/300-0-5.jpeg" alt="' + $(this)[0].name + '">'
                        + '<p class="sel-desc">' + $(this)[0].name + '</p>'
                        + '</a>'
                });
                $selList.html(str);
            }
            self.listRequest(function (data) {
                var result = data.data;
                total = data.count;
                self.waterFallStr(result,bid);
                var $ary = $('.wf-single').splice(0,3);
                $.each($ary,function (index,item) {
                    var div = document.createElement('div');
                    switch (index) {
                        case 0:
                            div.className = 'hot one';
                            break;
                        case 1:
                            div.className = 'hot two';
                            break;
                        case 2:
                            div.className = 'hot three';
                            break;
                    }
                    $(item).append(div);
                });

                $('#container img').on('load',function(){self.waterFall();});
                window.addEventListener('scroll', function () {
                    console.log(1);
                    if ($(window).scrollTop() + 2*$(window).height() >= $(document).height()) {
                        console.log(2);
                        self.waterLoadMore(total, page, bid);
                    }
                    self.toTop();
                }, false);
                // $(window).on('resize',function () {
                //     self.waterFall();});
                $('.heart').tap(function () {
                    var $count = $(this).next('span');
                    $count.html(parseInt($count.html())+1)
                });

            }, bid);

        });
    },
    //频道页
    channelInit: function () {
        var self = this,
            page = 1,
            total = 0,
            cid = this.queryURLParameter(url).id;
        this.channelList();
        this.homeRequest(function (data) {
            var chData = data.channels;
            var listStr = '';
            if (chData.length > 0) {
                $(chData).each(function () {
                    listStr += '<a href="channel.html?id=' + $(this)[0].id + '">' + $(this)[0].name + '</a>';
                });
                listStr += '<a href="search.html">搜索</a>';
                $('.ch-list').html(listStr);
            }

        });
        this.homeRequest(function (data) {
            var str = '';
            $('.ch-name').html(data.channel.name);
            $(data.labels).each(function () {
                str += '<a href="label.html?id=' + $(this)[0].id + '">' + $(this)[0].name + '</a>'
            });
            $('.label-list-inner').html(str);
        }, cid);
        this.listRequest(function (data) {
            var bid = self.queryURLParameter(url).id;
            var result = data.data;
            total = data.count;
            self.waterFallStr(result,bid);
            $('#container img').on('load',function(){self.waterFall();});
            window.addEventListener('scroll', function () {
                console.log(1);
                if ($(window).scrollTop() + 2*$(window).height() >= $(document).height()) {
                    console.log(2);
                    self.waterLoadMore(total, page, bid);
                }
                self.toTop();
            }, false);
            // $(window).on('resize',function () {
            //     self.waterFall();});
            $('.heart').tap(function () {
                var $count = $(this).next('span');
                $count.html(parseInt($count.html())+1)
            });

        }, cid);
        this.back();
    },
    //详情页
    detailInit: function () {
        var bid = this.queryURLParameter(url).id,
            gid = this.queryURLParameter(url).gid,
            self = this,
            flag = true,
            timer = null;
        this.listRequest(function (data) {
            $('.detail-title').html(data.name);
            $('.like-count').html(data.font_count);
            $('.total').html(data.picture_count);
            self.random(data.labels);
            var pics = data.picture;
            if (pics.length > 0) {
                var str = "";
                $(pics).each(function (index, item) {
                    str += '<li class="swiper-slide">'
                        + '<div class="loading">'
                        + '<img src="image/loading.png" alt="">'
                        + '<span class="load-content">图片加载中…</span>'
                        + '</div>'
                        + '<div  class="detail-pic">'
                        + '<img src="http://image.spider.oupeng.com/' + item.checksum + '/300-0-5.jpeg" alt="">'
                        + '</div>'
                        + '</li>';
                });
                $(".swiper-wrapper").html(str).css("width", $(window).width() * data.length + 1);
                $(".swiper-slide").css("width", $(window).width()).tap(function () {
                    if (flag == true) {
                        $('header').css('height', 0);
                        $('.bottom-info').css('height', 0);
                        flag = false;
                        return;
                    }
                    $('header').css('height', '1.32rem');
                    $('.bottom-info').css('height', '2.64rem');
                    flag = true;
                });
                var mySrc = $('.detail-pic img')[0].src;
                $('.load-icon').attr("href",mySrc).attr("download", "img.png");
                var clipboard = new Clipboard('.share', {
                    text: function() {
                        return mySrc;
                    }
                });

                clipboard.on('success', function(e) {
                    if(timer){
                        window.clearTimeout(timer);
                    }
                    $('.copy').animate({'opacity':1},200);
                    timer = window.setTimeout(function () {
                        $('.copy').animate({'opacity':0},300);
                    },1500)
                });

                clipboard.on('error', function(e) {
                    if(timer){
                        window.clearTimeout(timer);
                    }
                    $('.copy').animate({'opacity':1},200).html('复制链接失败');
                    timer = window.setTimeout(function () {
                        $('.copy').animate({'opacity':0},300);
                    },1500)

                });
                $('.heart').tap(function () {
                    var $count = $(this).next('span');
                    $count.html(parseInt($count.html())+1)
                });
            }
            var mySwiper = new Swiper('.swiper-container', {
                direction: 'horizontal',
                slidesPerView: 1,
                freeMode: false,
                // observer:true,
                // observeParents:true,
                onSlideChangeEnd: function (swiper) {
                    var mySrc = $('.detail-pic img')[swiper.activeIndex].src;
                    console.log(swiper.activeIndex);
                    $(".index").html((swiper.activeIndex + 1));
                    self.random(data.labels);
                    $('.load-icon').attr("href",mySrc).attr("download", "img.png");
                    var clipboard = new Clipboard('.share', {
                        text: function() {
                            return mySrc;
                        }
                    });
                }
            });
            $('.detail-pic img').on('load', function () {
                $('.loading').css('display', 'none');
            }).on('error', function () {
                $('.loading img').attr('src', 'image/failedLoad.png');
                $('.load-content').html('图片加载失败')
            });
        }, bid, gid);
        this.back();

        // $('.load').on('click',function () {
        //     self.downLoad()
        // })
    },
    //标签页
    labelInit: function () {
        var total = 0,
            page = 0,
            self = this;
        var lid = this.queryURLParameter(url).id;
        this.requestData('http://api.spider.oupeng.com/distributor?did=16&lid=' + lid + '&app_key=opgirl&app_secret=23ebda82e29f3ee38f0a081d97d340a5&page=1', 'get', function (data) {
            $('.ch-name').html(data.label.name);
        });
        this.listRequest(function (data) {
            var result = data.data;
            total = data.count;
            self.waterFallStr(result,lid);
            $('#container img').on('load',function(){self.waterFall();});
            window.addEventListener('scroll', function () {
                console.log(1);
                if ($(window).scrollTop() + 2*$(window).height() >= $(document).height()) {
                    console.log(2);
                    self.waterLoadMore(total, page, lid);
                }
                self.toTop();
            }, false);
            // $(window).on('resize',function () {
            //     self.waterFall();});
            $('.heart').tap(function () {
                var $count = $(this).next('span');
                $count.html(parseInt($count.html())+1)
            });
        }, lid);

        this.back();
    },
    //专题页
    subjectInit: function () {
        var total = 0,
            page = 1,
            self = this;
        var cid = this.queryURLParameter(url).id;
        this.homeRequest(function (data) {
            var src = data.channel.checksum;
            $('.sub-banner img')[0].src = 'http://image.spider.oupeng.com/' + src + '/300-0-5.jpeg';
        }, cid);

        // "file:///Users/lena/WebstormProjects/opera/public/subList.html?id="+ cid;
        this.listRequest(function (data) {
            var result = data.data;
            total = data.count;
            self.waterFallStr(result,cid);
            var $ary = $('.wf-single').splice(0,3);
            $.each($ary,function (index,item) {
                var div = document.createElement('div');
                switch (index) {
                    case 0:
                        div.className = 'hot one';
                        break;
                    case 1:
                        div.className = 'hot two';
                        break;
                    case 2:
                        div.className = 'hot three';
                        break;
                }
                $(item).append(div);
            });

            $('#container img').on('load',function(){self.waterFall();});
            window.addEventListener('scroll', function () {
                console.log(1);
                if ($(window).scrollTop() + 2*$(window).height() >= $(document).height()) {
                    console.log(2);
                    self.waterLoadMore(total, page, cid);
                }
                self.toTop();
            }, false);
            // $(window).on('resize',function () {
            //     self.waterFall();});
            $('.heart').tap(function () {
                var $count = $(this).next('span');
                $count.html(parseInt($count.html())+1)
            });

        }, cid);

        this.back();
    },
    //更多专题页
    subListInit: function () {
        this.homeRequest(function (data) {
            var sub = data.banners,
                str = '';
            $(sub).each(function (index, item) {
                str += '<a class="sub" href="subject.html?id=' + item.id + '">'
                    + '<img src="http://image.spider.oupeng.com/' + $(this)[0].checksum + '/300-0-5.jpeg" alt="' + $(this)[0].name + '" alt="' + $(this)[0].name + '">'
                    + '</a>'
            });
            $('.sub-wrap').html(str);
        });
        this.back();
    },
    //搜索页
    searchInit: function () {
        var self = this,
            total = 0,
            page = 1;
        //接口有改动
        this.homeRequest(function (data) {
            var chData = data.channels;
            var listStr = '';
            if (chData.length > 0) {
                $(chData).each(function (index, item) {
                    listStr += '<a href="channel.html?id=' + item.id + '">' + $(this)[0].name + '</a>';
                });
                $('.ser-list').html(listStr);
                $('.rel-list').html(listStr);
            }
        });
        var success = function (data) {
            var waterData = data.data;

            if (waterData.length > 0) {
                console.log(2);
                $('.ser-box').css('display', 'none');
                $('.ser-content').css('display', 'block');
                $('.no-ser').css('display', 'none');
                total = data.count;
                self.waterFallStr(waterData,24);

                $('#container img').on('load',function(){self.waterFall();});

                // self.waterFall(waterData, 24);
                // total = data.count;
                // page++;
                window.addEventListener('scroll', function () {

                    if ($(window).scrollTop() + 2*$(window).height() >= $(document).height()) {
                        var val = $('input').val();
                        self.requestData('http://api.spider.oupeng.com/gallery/list?bid=24&app_key=opgirl&app_secret=23ebda82e29f3ee38f0a081d97d340a5&page=' + page + '&keywords=' + val + '&page_limit=20', 'get', function (data) {
                            console.log(1);
                            var waterData = data.data;
                            if (waterData.length > 0) {
                                self.waterFall(waterData, 24);
                                page++;
                            }
                        });

                    }
                    self.toTop();
                }, false);
                $('.heart').tap(function () {
                    var $count = $(this).next('span');
                    $count.html(parseInt($count.html())+1)
                });
            } else {
                $('.ser-box').css('display', 'none');
                $('.ser-content').css('display', 'none');
                $('.no-ser').css('display', 'block');
            }
        };
        $('.ser-btn').on('click', function () {
            var val = $('input').val();
            console.log(val);
            self.requestData('http://api.spider.oupeng.com/gallery/list?bid=24&app_key=opgirl&app_secret=23ebda82e29f3ee38f0a081d97d340a5&page=1&keywords=' + val, 'get', success);
        });
        this.back();
    },
    //瀑布流加载更多
    waterLoadMore: function (total, page, bid) {
        var self = this;
        page++;
        // if (total > (10 + page * 20)) {
            this.requestData('http://api.spider.oupeng.com/gallery/list?bid=' + bid + '&app_key=opgirl&app_secret=23ebda82e29f3ee38f0a081d97d340a5&page=1&page_limit=20', 'get', function (data) {
                var result = data.data;
                self.waterFallStr(result,bid);
                $('#container img').on('load',function(){self.waterFall();});
            });
        // }

    },
    //频道列单
    channelList: function () {
        var $channel = $('.channel'),
            $chList = $('.ch-list'),
            $chClose = $('.ch-close'),
            $mask = $('.mask'),
            str = '';
        $channel.tap(function () {
            $(this).css('display', 'none');
            $chClose.css('display', 'block');
            $chList.css('display', 'block');
            $mask.css('display', 'block')
        });
        $chClose.tap(function () {
            $(this).css('display', 'none');
            $channel.css('display', 'block');
            $chList.css('display', 'none');
            $mask.css('display', 'none');
        });

    },
    //轮播图
    banner: function () {
        var $bannerInner = $('.swipe-wrap'),
            $bannerFocus = $('.banner-focus');
        var bindData = function (data) {
            var str = '', focusStr = '';
            $(data).each(function (index, item) {
                str += '<a class="banner-img" href="subject.html?id=' + item.id + '">'
                    + '<img src="http://image.spider.oupeng.com/' + $(this)[0].checksum + '/300-0-5.jpeg" alt="' + $(this)[0].name + '">'
                    + '</a>';
                focusStr += '<li class="b-focus"></li>'
            });
            $bannerInner.html(str);
            $bannerFocus.html(focusStr);
            $('.banner-focus li').eq(0).addClass('selected');
        };
        this.homeRequest(function (data) {
            var bannerData = data.banners;
            console.log(bannerData);
            if (bannerData.length > 0) {
                bindData(bannerData);
                var ele = document.getElementById('banner');
                window.mySwipe = Swipe(ele, {
                    auto: 3000,
                    continuous: true,
                    callback: function(index, element) {
                        $(".banner-focus li").eq(index).addClass("selected").siblings().removeClass("selected")}
                });
                $(".banner-focus li").click(function(){
                    mySwipe.slide($(this).index());
                });

            }
        });
    },
    // banner: function () {
    //     var $bannerInner = $('.banner-inner'),
    //         $bannerFocus = $('.banner-focus'),
    //         devWidth = $(window).width(),
    //         step = 0;
    //     // var si;
    //     // clearInterval(si);
    //     var bindData = function (data) {
    //         var str = '', focusStr = '';
    //         $(data).each(function (index, item) {
    //             str += '<a class="banner-img" href="subject.html?id=' + item.id + '">'
    //                 + '<img src="http://image.spider.oupeng.com/' + $(this)[0].checksum + '/300-0-5.jpeg" alt="' + $(this)[0].name + '">'
    //                 + '</a>';
    //             focusStr += '<li class="b-focus"></li>'
    //         });
    //         str += '<a class="banner-img" href="subject.html?id=' + $(data)[0].id + '">'
    //             + '<img src="http://image.spider.oupeng.com/' + $(data)[0].checksum + '/300-0-5.jpeg" alt="' + $(data)[0].name + '">'
    //             + '</a>';
    //         $bannerInner.html(str);
    //         $bannerFocus.html(focusStr);
    //         $('.banner-focus li').first().addClass('selected');
    //         var width = (data.length + 1) * devWidth;
    //         $bannerInner.css('width', width);
    //         $('.banner-img').css('width', devWidth);
    //
    //     };
    //     var autoMove = function (data) {
    //         if (step == data.length) {
    //             step = 0;
    //             $bannerInner.css('left', 0);
    //         }
    //         step++;
    //         $bannerInner.animate({'left': step * (-devWidth)}, 500);
    //
    //     };
    //     var focusAlign = function (data) {
    //         var tempStep = step === data.length ? 0 : step;
    //         $bannerFocus.children().each(function (index, item) {
    //             if (index == tempStep) {
    //                 $(this).addClass('selected').siblings().removeClass('selected');
    //             }
    //         })
    //     };
    //     this.homeRequest(function (data) {
    //         var bannerData = data.banners;
    //         console.log(bannerData);
    //         if (bannerData.length > 0) {
    //             bindData(bannerData);
    //             window.setInterval(function () {
    //                 autoMove(bannerData);
    //                 focusAlign(bannerData);
    //             }, 3000);
    //
    //         }
    //     });
    // },
    //首页专题和频道的请求
    homeRequest: function (fn, cid) {
        if (typeof cid != 'undefined') {
            return this.requestData('http://api.spider.oupeng.com/distributor?did=16&cid=' + cid + '&app_key=opgirl&app_secret=23ebda82e29f3ee38f0a081d97d340a5&page=1', 'get', fn)
        }
        return this.requestData('http://api.spider.oupeng.com/distributor?did=16&app_key=opgirl&app_secret=23ebda82e29f3ee38f0a081d97d340a5&page=1', 'get', fn)
    },
    //瀑布流数据的请求
    listRequest: function (fn, bid, gid) {
        console.log(bid);
        if (typeof gid != 'undefined') {
            return this.requestData('http://api.spider.oupeng.com/gallery/detail?bid=' + bid + '&gid=' + gid + '&app_key=opgirl&app_secret=23ebda82e29f3ee38f0a081d97d340a5&page=1', 'get', fn)
        }
        return this.requestData('http://api.spider.oupeng.com/gallery/list?bid=' + bid + '&app_key=opgirl&app_secret=23ebda82e29f3ee38f0a081d97d340a5&page=1&page_limit=10', 'get', fn)
    },
    //数据的请求
    requestData: function (url, type, fn, data) {
        data = data || '';
        $.ajax({
            url: url,
            type: type,
            data: data,
            dataType: 'json',
            success: fn
        })
    },
    //瀑布流功能实现
    waterFall: function () {
        var margin = $(window).width()/1080 * 42;
        var li=$("#container li");
        var	li_W = li[0].offsetWidth + margin;
        var h=[];
        var n =2;
        for(var i = 0;i < li.length;i++) {
            var li_H = li[i].offsetHeight;
            if(i < n) {
                h[i]=li_H;
                li.eq(i).css("top",0);
                li.eq(i).css("left",i * li_W);
                li.eq(i).css("visibility",'visible');
            }
            else{
                var min_H =Math.min.apply(null,h) ;
                var minKey = this.getarraykey(h, min_H);
                h[minKey] += li_H ;
                li.eq(i).css("top",min_H);
                li.eq(i).css("left",minKey * li_W);
                li.eq(i).css("visibility",'visible');
            }
        }
        var liH = parseInt(li.eq(li.length - 1).css('top'))+ li.eq(li.length - 1).height();
        $('#container').height(liH);
    },
    getarraykey:function (s, v) {
        for(k in s) {if(s[k] == v) {return k;}}
    },
    //瀑布流字符串拼接
    waterFallStr: function (result, bid) {
        var str = '';
        $(result).each(function (index, item) {
            var pic = item.picture[0];
            str += '<li class="wf-single">'
                + '<a href="detail.html?id=' + bid + '&gid=' + pic.gallery_id + '">'
                + '<img src=" http://image.spider.oupeng.com/' + pic.checksum + '/300-0-5.jpeg" alt="' + item.name + '">'
                + '</a>'
                + '<div class="wf-info">'
                + '<i class="icon heart">'
                + '</i>'
                + '<span>' + item.font_count + '</span>'
                + '<i class="icon pic-count">'
                + '</i>'
                + '<span>' + item.picture_count + '</span>'
                + '</div>'
                + '</li>';
        });
        $('#container').append(str);

    },
    //获取到id
    queryURLParameter: function (url) {
        var obj = {},
            reg = /([^?&=#]+)=([^?&=#]+)/g;
        url.replace(reg, function () {
            obj[arguments[1]] = arguments[2];
        });
        return obj;
    },
    // 返回箭头
    back: function () {
        $('.back-icon').tap(function () {
            window.history.back();
        });
    },
    random: function (labels) {
        var ary = [],
            str = '';
        for (var i = 0; i < 5; i++) {
            var random = Math.round(Math.random() * (labels.length - 1));
            if (ary.indexOf(random) == -1) {
                ary.push(random);
                continue;
            }
            i--;
        }
        console.log(ary);
        $(ary).each(function (index, item) {
            var label = labels[item];
            str += '<a href="label.html?id=' + label.id + '">' + label.name + '</a>'
        });
        console.log(str);
        $('.label-list-inner').html(str);
    },
    toTop: function () {
        var timer = null;
        if($(window).scrollTop() >= 2*$(window).height()){
            if(timer){
                window.clearTimeout(timer);
            }
            $('.toTop').animate({'opacity':1},500)
        }
        $('.toTop').on('click',function () {
             timer = window.setTimeout(function () {
                 $('.toTop').animate({'opacity':0},500)
            },1000)
        })
    }
};

$(document).ready(function ($) {
    if (homeReg.test(url)) {
        opGirlFn.homeInit();
        window.addEventListener("resize", function () {
            opGirlFn.banner();
        }, false);
    } else if (channelReg.test(url)) {
        opGirlFn.channelInit()
    } else if (subListReg.test(url)) {
        opGirlFn.subListInit()
    } else if (subjectReg.test(url)) {
        opGirlFn.subjectInit();
    } else if (labelReg.test(url)) {
        opGirlFn.labelInit();
    } else if (detailReg.test(url)) {
        opGirlFn.detailInit();
    } else if (searchReg.test(url)) {
        opGirlFn.searchInit();
    }

});


