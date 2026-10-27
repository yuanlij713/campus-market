/* 用户端视图组件，挂载到全局 UserViews */
(function () {
  'use strict';
  var CAMPUSES = ['九站校区', '左家校区'];
  var CAT_ICONS = ['Goods', 'Reading', 'Headset', 'Bicycle', 'Basketball', 'Notebook', 'Watch', 'Box', 'Present', 'ShoppingBag'];
  var GRADS = [
    'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
    'linear-gradient(135deg,#43cea2 0%,#185a9d 100%)',
    'linear-gradient(135deg,#f7971e 0%,#b07d2b 100%)'
  ];
  var PROD_STATUS = {
    0: { t: '待审核', type: 'warning' },
    1: { t: '在售', type: 'success' },
    2: { t: '已拒绝', type: 'danger' },
    3: { t: '已下架', type: 'info' }
  };
  var ORDER_STATUS = {
    0: { t: '待确认', type: 'warning' },
    1: { t: '待交付', type: 'primary' },
    2: { t: '已完成', type: 'success' },
    3: { t: '已取消', type: 'info' }
  };

  function ok(m) { ElementPlus.ElMessage.success(m); }
  function warn(m) { ElementPlus.ElMessage.warning(m); }
  function needLogin() {
    if (!store.token) { location.hash = '#/login'; return true; }
    return false;
  }
  function buildCatOptions(categories) {
    var byId = {};
    categories.forEach(function (c) { byId[c.id] = c; });
    return categories.map(function (c) {
      var p = c.parentId ? byId[c.parentId] : null;
      return { id: c.id, label: p ? (p.name + ' / ' + c.name) : c.name };
    });
  }

  /* ================= 首页 ================= */
  var HomeView = {
    template: [
      '<div>',
      '  <el-carousel v-if="anns.length" height="200px" class="home-carousel">',
      '    <el-carousel-item v-for="(a, i) in anns" :key="a.id">',
      '      <div class="banner" :style="{ background: grads[i % grads.length] }">',
      '        <div class="banner-title">{{ a.title }}</div>',
      '        <div class="banner-content">{{ a.content }}</div>',
      '      </div>',
      '    </el-carousel-item>',
      '  </el-carousel>',
      '  <div class="cat-row">',
      '    <div class="cat-item" v-for="(c, i) in categories" :key="c.id" @click="goCat(c)">',
      '      <el-icon :size="26"><component :is="catIcons[i % catIcons.length]"></component></el-icon>',
      '      <span>{{ c.name }}</span>',
      '    </div>',
      '  </div>',
      '  <div class="search-row">',
      '    <el-input v-model="keyword" placeholder="搜索闲置好物，如：高数教材" clearable @keyup.enter="goSearch">',
      '      <template #append><el-button @click="goSearch"><el-icon><search></search></el-icon></el-button></template>',
      '    </el-input>',
      '    <el-select v-model="campus" placeholder="全部校区" clearable style="width:140px" @change="goSearch">',
      '      <el-option v-for="c in campuses" :key="c" :label="c" :value="c"></el-option>',
      '    </el-select>',
      '  </div>',
      '  <div class="section-title">最新上架</div>',
      '  <div v-loading="loading">',
      '    <el-empty v-if="!loading && products.length === 0" description="暂无商品"></el-empty>',
      '    <div class="prod-grid">',
      '      <div class="prod-card" v-for="p in products" :key="p.id" @click="goDetail(p)">',
      '        <img class="prod-img" :src="cover(p.images)">',
      '        <div class="prod-body">',
      '          <div class="prod-title">{{ p.title }}</div>',
      '          <div class="prod-price">¥{{ money(p.price) }}<span class="prod-orig" v-if="p.originalPrice">¥{{ money(p.originalPrice) }}</span></div>',
      '          <div class="prod-meta">',
      '            <el-tag size="small" type="info">{{ p.campus }}</el-tag>',
      '            <span class="prod-views"><el-icon><view></view></el-icon>{{ p.views }}</span>',
      '          </div>',
      '          <div class="prod-seller">',
      '            <img :src="p.sellerAvatar || \'/img/seed/avatar1.svg\'" class="mini-avatar">',
      '            <span>{{ p.sellerName }}</span>',
      '            <el-tag v-if="p.sellerVerified === 1" size="small" type="success">已核验</el-tag>',
      '          </div>',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div class="pager">',
      '      <el-pagination background layout="prev, pager, next, total" :total="total" :page-size="size" :current-page="page" @current-change="onPage"></el-pagination>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n'),
    data: function () {
      return {
        anns: [], categories: [], products: [], total: 0, page: 1, size: 8,
        keyword: '', campus: '', loading: false,
        grads: GRADS, catIcons: CAT_ICONS, campuses: CAMPUSES
      };
    },
    mounted: function () { this.load(); },
    methods: {
      cover: util.cover, money: util.money,
      load: function () {
        var self = this;
        api.get('/api/announcements').then(function (d) { self.anns = d || []; }).catch(function () {});
        api.get('/api/categories').then(function (d) {
          var tops = (d || []).filter(function (c) { return !c.parentId; });
          self.categories = tops.length ? tops : (d || []);
        }).catch(function () {});
        this.loadProducts();
      },
      loadProducts: function () {
        var self = this;
        self.loading = true;
        api.get('/api/products', { page: this.page, size: this.size }).then(function (d) {
          self.products = d.list || [];
          self.total = d.total || 0;
          self.loading = false;
        }).catch(function () { self.loading = false; });
      },
      onPage: function (p) { this.page = p; this.loadProducts(); },
      goCat: function (c) { location.hash = '#/products?categoryId=' + c.id; },
      goSearch: function () {
        var q = [];
        if (this.keyword) q.push('keyword=' + encodeURIComponent(this.keyword));
        if (this.campus) q.push('campus=' + encodeURIComponent(this.campus));
        location.hash = '#/products' + (q.length ? '?' + q.join('&') : '');
      },
      goDetail: function (p) { location.hash = '#/product?id=' + p.id; }
    }
  };

  /* ================= 商品列表 ================= */
  var ProductsView = {
    props: ['query'],
    template: [
      '<div>',
      '  <div class="filter-card">',
      '    <el-select v-model="categoryId" placeholder="全部分类" clearable style="width:180px" @change="search">',
      '      <el-option v-for="c in catOptions" :key="c.id" :label="c.label" :value="c.id"></el-option>',
      '    </el-select>',
      '    <el-select v-model="campus" placeholder="全部校区" clearable style="width:140px" @change="search">',
      '      <el-option v-for="c in campuses" :key="c" :label="c" :value="c"></el-option>',
      '    </el-select>',
      '    <el-select v-model="sort" placeholder="默认排序" clearable style="width:140px">',
      '      <el-option label="价格从低到高" value="price_asc"></el-option>',
      '      <el-option label="价格从高到低" value="price_desc"></el-option>',
      '    </el-select>',
      '    <el-input v-model="keyword" placeholder="关键词" clearable style="width:220px" @keyup.enter="search"></el-input>',
      '    <el-button type="primary" @click="search"><el-icon><search></search></el-icon>搜索</el-button>',
      '    <el-button @click="reset">重置</el-button>',
      '  </div>',
      '  <div v-loading="loading">',
      '    <el-empty v-if="!loading && products.length === 0" description="没有找到相关商品"></el-empty>',
      '    <div class="prod-grid">',
      '      <div class="prod-card" v-for="p in sortedProducts" :key="p.id" @click="goDetail(p)">',
      '        <img class="prod-img" :src="cover(p.images)">',
      '        <div class="prod-body">',
      '          <div class="prod-title">{{ p.title }}</div>',
      '          <div class="prod-price">¥{{ money(p.price) }}<span class="prod-orig" v-if="p.originalPrice">¥{{ money(p.originalPrice) }}</span></div>',
      '          <div class="prod-meta">',
      '            <el-tag size="small" type="info">{{ p.campus }}</el-tag>',
      '            <span class="prod-views"><el-icon><view></view></el-icon>{{ p.views }}</span>',
      '          </div>',
      '          <div class="prod-seller">',
      '            <img :src="p.sellerAvatar || \'/img/seed/avatar1.svg\'" class="mini-avatar">',
      '            <span>{{ p.sellerName }}</span>',
      '            <el-tag v-if="p.sellerVerified === 1" size="small" type="success">已核验</el-tag>',
      '          </div>',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div class="pager">',
      '      <el-pagination background layout="prev, pager, next, total" :total="total" :page-size="size" :current-page="page" @current-change="onPage"></el-pagination>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n'),
    data: function () {
      var q = this.query || {};
      return {
        categories: [], campuses: CAMPUSES,
        keyword: q.keyword || '',
        categoryId: q.categoryId ? Number(q.categoryId) : '',
        campus: q.campus || '',
        sort: '', products: [], total: 0, page: 1, size: 12, loading: false
      };
    },
    computed: {
      catOptions: function () { return buildCatOptions(this.categories); },
      sortedProducts: function () {
        var arr = this.products.slice();
        if (this.sort === 'price_asc') arr.sort(function (a, b) { return a.price - b.price; });
        else if (this.sort === 'price_desc') arr.sort(function (a, b) { return b.price - a.price; });
        return arr;
      }
    },
    mounted: function () {
      var self = this;
      api.get('/api/categories').then(function (d) { self.categories = d || []; }).catch(function () {});
      this.load();
    },
    methods: {
      cover: util.cover, money: util.money,
      load: function () {
        var self = this;
        self.loading = true;
        api.get('/api/products', {
          categoryId: this.categoryId, campus: this.campus, keyword: this.keyword,
          page: this.page, size: this.size
        }).then(function (d) {
          self.products = d.list || [];
          self.total = d.total || 0;
          self.loading = false;
        }).catch(function () { self.loading = false; });
      },
      search: function () { this.page = 1; this.load(); },
      reset: function () {
        this.keyword = ''; this.categoryId = ''; this.campus = ''; this.sort = '';
        this.search();
      },
      onPage: function (p) { this.page = p; this.load(); },
      goDetail: function (p) { location.hash = '#/product?id=' + p.id; }
    }
  };

  /* ================= 商品详情 ================= */
  var ProductDetailView = {
    props: ['query'],
    template: [
      '<div v-loading="loading">',
      '  <div v-if="p" class="detail-wrap">',
      '    <div class="detail-gallery">',
      '      <img class="detail-main-img" :src="curImg">',
      '      <div class="thumb-row" v-if="imgs.length > 1">',
      '        <img v-for="(im, i) in imgs" :key="i" :src="im" class="thumb" :class="{ active: curImg === im }" @click="curImg = im">',
      '      </div>',
      '    </div>',
      '    <div class="detail-info">',
      '      <div class="detail-title">{{ p.title }}<el-tag v-if="p.status !== 1" type="info" size="small">非在售</el-tag></div>',
      '      <div style="margin:10px 0"><span class="price-now">¥{{ money(p.price) }}</span><span class="price-orig" v-if="p.originalPrice">¥{{ money(p.originalPrice) }}</span></div>',
      '      <div class="detail-meta">',
      '        <span>库存 {{ p.stock }}</span><span>校区：{{ p.campus }}</span>',
      '        <span>发布于 {{ fmt(p.createdAt) }}</span><span>浏览 {{ p.views }}</span>',
      '      </div>',
      '      <div class="seller-card" @click="showReviews">',
      '        <img class="seller-avatar" :src="p.sellerAvatar || \'/img/seed/avatar1.svg\'">',
      '        <div style="flex:1;min-width:0">',
      '          <div style="font-weight:600">{{ p.sellerName }} <el-tag v-if="p.sellerVerified === 1" type="success" size="small">已核验</el-tag></div>',
      '          <div style="font-size:12px;color:#909399" v-if="seller">平均评分 {{ seller.avgRating ? Number(seller.avgRating).toFixed(1) : \'暂无\' }} · 注册于 {{ fmt(seller.createdAt) }}</div>',
      '        </div>',
      '        <el-button size="small" text type="primary">查看评价</el-button>',
      '      </div>',
      '      <div class="detail-desc">{{ p.description }}</div>',
      '      <div class="op-row">',
      '        <el-button :type="fav ? \'warning\' : \'default\'" :loading="favLoading" @click="toggleFav"><el-icon><star></star></el-icon>&nbsp;{{ fav ? \'已收藏\' : \'收藏\' }}</el-button>',
      '        <el-button v-if="!isMine()" type="primary" plain @click="contact"><el-icon><chat-dot-round></chat-dot-round></el-icon>&nbsp;联系卖家</el-button>',
      '        <el-button v-if="!isMine()" type="danger" :disabled="!canBuy()" @click="openBuy">立即购买</el-button>',
      '        <el-button v-if="!isMine()" text type="info" @click="openReport">举报</el-button>',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <el-empty v-if="!loading && !p" description="商品不存在或已删除"></el-empty>',
      '  <el-dialog v-model="buyDlg" title="确认下单" width="420px">',
      '    <el-form label-width="90px">',
      '      <el-form-item label="数量"><el-input-number v-model="buyForm.quantity" :min="1" :max="p ? p.stock : 1"></el-input-number></el-form-item>',
      '      <el-form-item label="交易地点"><el-input v-model="buyForm.meetLocation" placeholder="如：九站校区图书馆门口"></el-input></el-form-item>',
      '      <el-form-item label="备注"><el-input v-model="buyForm.remark" type="textarea" :rows="2"></el-input></el-form-item>',
      '    </el-form>',
      '    <template #footer>',
      '      <el-button @click="buyDlg = false">取消</el-button>',
      '      <el-button type="primary" :loading="buyLoading" @click="submitBuy">提交订单</el-button>',
      '    </template>',
      '  </el-dialog>',
      '  <el-dialog v-model="reportDlg" title="举报商品" width="420px">',
      '    <el-input v-model="reportReason" type="textarea" :rows="4" placeholder="请描述举报原因"></el-input>',
      '    <template #footer>',
      '      <el-button @click="reportDlg = false">取消</el-button>',
      '      <el-button type="danger" :loading="reportLoading" @click="submitReport">提交举报</el-button>',
      '    </template>',
      '  </el-dialog>',
      '  <el-dialog v-model="reviewDlg" title="卖家收到的评价" width="520px">',
      '    <div v-loading="reviewsLoading">',
      '      <el-empty v-if="!reviewsLoading && reviews.length === 0" description="暂无评价"></el-empty>',
      '      <div v-for="r in reviews" :key="r.id" style="display:flex;gap:10px;margin-bottom:14px">',
      '        <img :src="r.reviewerAvatar || \'/img/seed/avatar2.svg\'" style="width:32px;height:32px;border-radius:50%;object-fit:cover">',
      '        <div style="flex:1;min-width:0">',
      '          <div style="font-size:13px;font-weight:600">{{ r.reviewerName }}<el-rate :model-value="r.rating" disabled size="small" style="display:inline-flex;vertical-align:middle;margin-left:6px"></el-rate></div>',
      '          <div style="font-size:13px;margin:4px 0">{{ r.content }}</div>',
      '          <div style="font-size:11px;color:#c0c4cc">{{ fmt(r.createdAt) }}</div>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </el-dialog>',
      '</div>'
    ].join('\n'),
    data: function () {
      return {
        p: null, imgs: [], curImg: '', seller: null, loading: true,
        fav: false, favLoading: false,
        buyDlg: false, buyForm: { quantity: 1, meetLocation: '', remark: '' }, buyLoading: false,
        reportDlg: false, reportReason: '', reportLoading: false,
        reviewDlg: false, reviews: [], reviewsLoading: false
      };
    },
    mounted: function () { this.init(); },
    methods: {
      fmt: util.fmt, money: util.money,
      init: function () {
        var self = this;
        var id = this.query && this.query.id;
        if (!id) { location.hash = '#/'; return; }
        api.get('/api/products/' + id).then(function (d) {
          self.p = d;
          self.imgs = d.images ? d.images.split(',').filter(function (x) { return !!x; }) : [util.cover(null)];
          self.curImg = self.imgs[0];
          self.loading = false;
          api.get('/api/users/' + d.userId).then(function (u) { self.seller = u; }).catch(function () {});
          if (store.token) {
            api.get('/api/favorites/check/' + d.id).then(function (f) { self.fav = !!f; }).catch(function () {});
          }
        }).catch(function () { self.loading = false; });
      },
      isMine: function () { return !!(store.user && this.p && store.user.id === this.p.userId); },
      canBuy: function () { return this.p && this.p.status === 1 && !this.isMine(); },
      toggleFav: function () {
        if (needLogin()) return;
        var self = this;
        self.favLoading = true;
        api.post('/api/favorites/' + self.p.id).then(function (d) {
          self.fav = d.favorited;
          ok(d.favorited ? '已收藏' : '已取消收藏');
          self.favLoading = false;
        }).catch(function () { self.favLoading = false; });
      },
      contact: function () {
        if (needLogin()) return;
        location.hash = '#/chat?user=' + this.p.userId;
      },
      openBuy: function () {
        if (needLogin()) return;
        this.buyForm = { quantity: 1, meetLocation: '', remark: '' };
        this.buyDlg = true;
      },
      submitBuy: function () {
        if (!this.buyForm.meetLocation) { warn('请填写线下交易地点'); return; }
        var self = this;
        self.buyLoading = true;
        api.post('/api/orders', {
          productId: self.p.id,
          quantity: self.buyForm.quantity,
          meetLocation: self.buyForm.meetLocation,
          remark: self.buyForm.remark
        }).then(function () {
          ok('下单成功，请等待卖家确认');
          self.buyDlg = false;
          self.buyLoading = false;
          location.hash = '#/orders';
        }).catch(function () { self.buyLoading = false; });
      },
      openReport: function () {
        if (needLogin()) return;
        this.reportReason = '';
        this.reportDlg = true;
      },
      submitReport: function () {
        if (!this.reportReason) { warn('请填写举报原因'); return; }
        var self = this;
        self.reportLoading = true;
        api.post('/api/reports', { productId: self.p.id, reason: self.reportReason }).then(function () {
          ok('举报已提交，感谢反馈');
          self.reportDlg = false;
          self.reportLoading = false;
        }).catch(function () { self.reportLoading = false; });
      },
      showReviews: function () {
        var self = this;
        self.reviewDlg = true;
        self.reviewsLoading = true;
        api.get('/api/reviews/user/' + self.p.userId).then(function (d) {
          self.reviews = d || [];
          self.reviewsLoading = false;
        }).catch(function () { self.reviewsLoading = false; });
      }
    }
  };

  /* ================= 发布 / 编辑商品 ================= */
  var PublishView = {
    props: ['query'],
    template: [
      '<div style="max-width:720px;margin:0 auto;background:#fff;border-radius:10px;padding:24px">',
      '  <div class="section-title">{{ editId ? \'编辑商品\' : \'发布商品\' }}</div>',
      '  <el-form label-width="90px">',
      '    <el-form-item label="标题" required><el-input v-model="form.title" maxlength="50" show-word-limit placeholder="一句话描述你的闲置"></el-input></el-form-item>',
      '    <el-form-item label="分类" required>',
      '      <el-select v-model="form.categoryId" placeholder="请选择分类" style="width:100%">',
      '        <el-option v-for="c in catOptions" :key="c.id" :label="c.label" :value="c.id"></el-option>',
      '      </el-select>',
      '    </el-form-item>',
      '    <el-form-item label="价格" required><el-input-number v-model="form.price" :min="0" :precision="2" :step="1"></el-input-number></el-form-item>',
      '    <el-form-item label="原价"><el-input-number v-model="form.originalPrice" :min="0" :precision="2" :step="1"></el-input-number></el-form-item>',
      '    <el-form-item label="库存" required><el-input-number v-model="form.stock" :min="1" :max="999"></el-input-number></el-form-item>',
      '    <el-form-item label="校区" required>',
      '      <el-select v-model="form.campus" placeholder="请选择校区" style="width:100%">',
      '        <el-option v-for="c in campuses" :key="c" :label="c" :value="c"></el-option>',
      '      </el-select>',
      '    </el-form-item>',
      '    <el-form-item label="商品图片">',
      '      <el-upload v-model:file-list="fileList" list-type="picture-card" accept="image/*" :limit="5" :http-request="upReq" :on-exceed="onExceed">',
      '        <el-icon><plus></plus></el-icon>',
      '      </el-upload>',
      '    </el-form-item>',
      '    <el-form-item label="描述">',
      '      <el-input v-model="form.description" type="textarea" :rows="5" maxlength="500" show-word-limit placeholder="成色、入手渠道、瑕疵说明等"></el-input>',
      '    </el-form-item>',
      '    <el-form-item>',
      '      <el-button type="primary" :loading="saving" @click="submit">{{ editId ? \'保存修改\' : \'提交发布\' }}</el-button>',
      '      <el-button @click="$router ? 0 : back()">返回</el-button>',
      '    </el-form-item>',
      '  </el-form>',
      '</div>'
    ].join('\n'),
    data: function () {
      return {
        form: { title: '', description: '', price: null, originalPrice: null, categoryId: '', campus: '', stock: 1 },
        fileList: [], categories: [], campuses: CAMPUSES, saving: false, editId: null
      };
    },
    computed: {
      catOptions: function () { return buildCatOptions(this.categories); }
    },
    mounted: function () {
      var self = this;
      api.get('/api/categories').then(function (d) { self.categories = d || []; }).catch(function () {});
      var id = this.query && this.query.id;
      if (id) {
        self.editId = id;
        api.get('/api/products/' + id).then(function (p) {
          self.form = {
            title: p.title, description: p.description, price: p.price,
            originalPrice: p.originalPrice, categoryId: p.categoryId, campus: p.campus, stock: p.stock
          };
          if (p.images) {
            self.fileList = p.images.split(',').filter(function (x) { return !!x; }).map(function (u, i) {
              return { name: '图片' + (i + 1), url: u, status: 'success' };
            });
          }
        }).catch(function () {});
      }
    },
    methods: {
      back: function () { history.back(); },
      upReq: function (param) {
        var self = this;
        api.upload(param.file).then(function (url) {
          var f = self.fileList.find(function (x) { return x.uid === param.file.uid; });
          if (f) f.url = url;
          param.onSuccess(url);
          ok('上传成功');
        }).catch(function (e) { param.onError(e); });
      },
      onExceed: function () { warn('最多上传 5 张图片'); },
      submit: function () {
        var f = this.form;
        if (!f.title) { warn('请填写标题'); return; }
        if (!f.categoryId) { warn('请选择分类'); return; }
        if (f.price === null || f.price === undefined) { warn('请填写价格'); return; }
        if (!f.stock) { warn('请填写库存'); return; }
        if (!f.campus) { warn('请选择校区'); return; }
        var images = this.fileList.filter(function (x) { return !!x.url; }).map(function (x) { return x.url; }).join(',');
        var body = {
          title: f.title, description: f.description, price: f.price,
          originalPrice: f.originalPrice, categoryId: f.categoryId,
          campus: f.campus, images: images, stock: f.stock
        };
        var self = this;
        self.saving = true;
        var p = self.editId ? api.put('/api/products/' + self.editId, body) : api.post('/api/products', body);
        p.then(function () {
          ok(self.editId ? '保存成功' : '发布成功，已提交审核');
          self.saving = false;
          location.hash = '#/center';
        }).catch(function () { self.saving = false; });
      }
    }
  };

  /* ================= 登录 / 注册 / 找回密码 ================= */
  var LoginView = {
    template: [
      '<div class="auth-wrap"><div class="auth-card">',
      '  <div class="auth-title">登录校园易淘</div>',
      '  <el-form label-position="top">',
      '    <el-form-item label="用户名"><el-input v-model="form.username" placeholder="请输入用户名"></el-input></el-form-item>',
      '    <el-form-item label="密码"><el-input v-model="form.password" type="password" show-password placeholder="请输入密码" @keyup.enter="submit"></el-input></el-form-item>',
      '    <el-button type="primary" style="width:100%" :loading="loading" @click="submit">登 录</el-button>',
      '  </el-form>',
      '  <div class="auth-links"><a @click="go(\'#/forgot\')">忘记密码？</a><a @click="go(\'#/register\')">注册新账号</a></div>',
      '</div></div>'
    ].join('\n'),
    data: function () { return { form: { username: '', password: '' }, loading: false }; },
    methods: {
      go: function (h) { location.hash = h; },
      submit: function () {
        if (!this.form.username || !this.form.password) { warn('请输入用户名和密码'); return; }
        var self = this;
        self.loading = true;
        api.post('/api/auth/login', this.form).then(function (d) {
          store.setAuth(d.token, d.user);
          ok('登录成功，欢迎回来');
          self.loading = false;
          location.hash = '#/';
        }).catch(function () { self.loading = false; });
      }
    }
  };

  var RegisterView = {
    template: [
      '<div class="auth-wrap"><div class="auth-card">',
      '  <div class="auth-title">注册校园易淘</div>',
      '  <div class="auth-tip">填写学号 + 校园邮箱即完成身份核验</div>',
      '  <el-form label-position="top">',
      '    <el-form-item label="用户名" required><el-input v-model="form.username" placeholder="登录账号"></el-input></el-form-item>',
      '    <el-form-item label="密码" required><el-input v-model="form.password" type="password" show-password placeholder="至少6位"></el-input></el-form-item>',
      '    <el-form-item label="昵称" required><el-input v-model="form.nickname" placeholder="展示给其他同学的名字"></el-input></el-form-item>',
      '    <el-form-item label="学号" required><el-input v-model="form.studentId" placeholder="学生学号"></el-input></el-form-item>',
      '    <el-form-item label="校园邮箱" required><el-input v-model="form.email" placeholder="如 xxx@stu.edu.cn"></el-input></el-form-item>',
      '    <el-form-item label="校区" required>',
      '      <el-select v-model="form.campus" placeholder="请选择校区" style="width:100%">',
      '        <el-option v-for="c in campuses" :key="c" :label="c" :value="c"></el-option>',
      '      </el-select>',
      '    </el-form-item>',
      '    <el-button type="primary" style="width:100%" :loading="loading" @click="submit">注 册</el-button>',
      '  </el-form>',
      '  <div class="auth-links"><span></span><a @click="go(\'#/login\')">已有账号？去登录</a></div>',
      '</div></div>'
    ].join('\n'),
    data: function () {
      return {
        form: { username: '', password: '', nickname: '', studentId: '', email: '', campus: '' },
        campuses: CAMPUSES, loading: false
      };
    },
    methods: {
      go: function (h) { location.hash = h; },
      submit: function () {
        var f = this.form;
        if (!f.username || !f.password || !f.nickname || !f.studentId || !f.email || !f.campus) {
          warn('请完整填写所有信息'); return;
        }
        var self = this;
        self.loading = true;
        api.post('/api/auth/register', f).then(function (d) {
          store.setAuth(d.token, d.user);
          ok('注册成功，已自动登录');
          self.loading = false;
          location.hash = '#/';
        }).catch(function () { self.loading = false; });
      }
    }
  };

  var ForgotView = {
    template: [
      '<div class="auth-wrap"><div class="auth-card">',
      '  <div class="auth-title">找回密码</div>',
      '  <div class="auth-tip">通过学号 + 校园邮箱校验身份后重置密码</div>',
      '  <el-form label-position="top">',
      '    <el-form-item label="学号" required><el-input v-model="form.studentId"></el-input></el-form-item>',
      '    <el-form-item label="校园邮箱" required><el-input v-model="form.email"></el-input></el-form-item>',
      '    <el-form-item label="新密码" required><el-input v-model="form.newPassword" type="password" show-password></el-input></el-form-item>',
      '    <el-button type="primary" style="width:100%" :loading="loading" @click="submit">重置密码</el-button>',
      '  </el-form>',
      '  <div class="auth-links"><span></span><a @click="go(\'#/login\')">返回登录</a></div>',
      '</div></div>'
    ].join('\n'),
    data: function () { return { form: { studentId: '', email: '', newPassword: '' }, loading: false }; },
    methods: {
      go: function (h) { location.hash = h; },
      submit: function () {
        var f = this.form;
        if (!f.studentId || !f.email || !f.newPassword) { warn('请完整填写信息'); return; }
        var self = this;
        self.loading = true;
        api.post('/api/auth/forgot', f).then(function () {
          ok('密码重置成功，请使用新密码登录');
          self.loading = false;
          location.hash = '#/login';
        }).catch(function () { self.loading = false; });
      }
    }
  };

  /* ================= 聊天 ================= */
  var ChatView = {
    props: ['query'],
    template: [
      '<div class="chat-wrap">',
      '  <div class="conv-list">',
      '    <el-empty v-if="convs.length === 0" description="暂无会话" :image-size="60"></el-empty>',
      '    <div v-for="c in convs" :key="c.otherId" class="conv-item" :class="{ active: otherId === c.otherId }" @click="openChat(c.otherId)">',
      '      <el-badge :value="c.unread" :hidden="!c.unread" :max="99">',
      '        <img :src="c.avatar || \'/img/seed/avatar3.svg\'" class="conv-avatar">',
      '      </el-badge>',
      '      <div style="flex:1;min-width:0">',
      '        <div class="conv-name">{{ c.name }}</div>',
      '        <div class="conv-last">{{ c.content }}</div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <div class="chat-main">',
      '    <div class="chat-header">{{ other ? other.name : \'请选择会话\' }}</div>',
      '    <div class="msg-list" ref="msgList">',
      '      <div v-for="m in messages" :key="m.id" class="msg-row" :class="{ me: m.senderId === myId }">',
      '        <div>',
      '          <div class="msg-bubble">{{ m.content }}</div>',
      '          <div class="msg-time">{{ fmt(m.createdAt) }}</div>',
      '        </div>',
      '      </div>',
      '      <el-empty v-if="otherId && messages.length === 0" description="打个招呼，开始聊天吧" :image-size="60"></el-empty>',
      '    </div>',
      '    <div class="chat-input">',
      '      <el-input v-model="input" placeholder="输入消息…" :disabled="!otherId" @keyup.enter="send"></el-input>',
      '      <el-button type="primary" :disabled="!otherId" :loading="sending" @click="send">发送</el-button>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n'),
    data: function () {
      return { convs: [], otherId: null, other: null, messages: [], input: '', sending: false, timer: null };
    },
    computed: {
      myId: function () { return store.user ? store.user.id : -1; }
    },
    mounted: function () {
      var u = this.query && this.query.user;
      this.loadConvs();
      if (u) this.openChat(Number(u));
      this.timer = setInterval(this.tick, 3000);
    },
    unmounted: function () { if (this.timer) clearInterval(this.timer); },
    methods: {
      fmt: util.fmt,
      loadConvs: function () {
        var self = this;
        api.get('/api/messages/conversations').then(function (d) {
          self.convs = d || [];
          if (self.otherId) {
            var c = self.convs.find(function (x) { return x.otherId === self.otherId; });
            if (c) self.other = { id: c.otherId, name: c.name, avatar: c.avatar };
          }
        }).catch(function () {});
      },
      refreshUnread: function () {
        if (!store.token) return;
        api.get('/api/messages/unread-count').then(function (n) { store.unread = n; }).catch(function () {});
      },
      tick: function () {
        this.loadConvs();
        if (this.otherId) this.loadMsgs(false);
        this.refreshUnread();
      },
      openChat: function (uid) {
        var self = this;
        self.otherId = uid;
        var c = self.convs.find(function (x) { return x.otherId === uid; });
        if (c) {
          self.other = { id: uid, name: c.name, avatar: c.avatar };
        } else {
          api.get('/api/users/' + uid).then(function (u) {
            self.other = { id: uid, name: u.nickname, avatar: u.avatar };
          }).catch(function () {});
        }
        self.loadMsgs(true);
      },
      loadMsgs: function (scroll) {
        var self = this;
        if (!self.otherId) return;
        api.get('/api/messages/with/' + self.otherId).then(function (d) {
          self.messages = d || [];
          if (scroll) {
            self.$nextTick(function () {
              var el = self.$refs.msgList;
              if (el) el.scrollTop = el.scrollHeight;
            });
          }
        }).catch(function () {});
      },
      send: function () {
        var content = this.input.trim();
        if (!content) return;
        if (!this.otherId) return;
        var self = this;
        self.sending = true;
        api.post('/api/messages', { receiverId: self.otherId, content: content }).then(function () {
          self.input = '';
          self.sending = false;
          self.loadMsgs(true);
          self.loadConvs();
        }).catch(function () { self.sending = false; });
      }
    }
  };

  /* ================= 我的订单 ================= */
  var OrdersView = {
    template: [
      '<div>',
      '  <el-tabs v-model="tab" @tab-change="load">',
      '    <el-tab-pane label="我买到的" name="buyer"></el-tab-pane>',
      '    <el-tab-pane label="我卖出的" name="seller"></el-tab-pane>',
      '  </el-tabs>',
      '  <div v-loading="loading">',
      '    <el-empty v-if="!loading && list.length === 0" description="暂无订单"></el-empty>',
      '    <div class="order-card" v-for="o in list" :key="o.id">',
      '      <div class="order-head"><span>订单号：{{ o.orderNo }}</span><span>{{ fmt(o.createdAt) }}</span></div>',
      '      <div class="order-body">',
      '        <img class="order-img" :src="cover(o.image)">',
      '        <div class="order-info">',
      '          <div style="font-weight:600;margin-bottom:4px">{{ o.title }}</div>',
      '          <div style="color:#909399;font-size:13px">单价 ¥{{ money(o.price) }} × {{ o.quantity }} ｜ 交易地点：{{ o.meetLocation || \'未填写\' }}<span v-if="o.remark"> ｜ 备注：{{ o.remark }}</span></div>',
      '          <div style="color:#909399;font-size:13px">{{ tab === \'buyer\' ? (\'卖家：\' + o.sellerName) : (\'买家：\' + o.buyerName) }}</div>',
      '        </div>',
      '        <div style="text-align:right">',
      '          <div style="color:#f56c6c;font-weight:700;font-size:18px;margin-bottom:6px">¥{{ money(o.price * o.quantity) }}</div>',
      '          <el-tag :type="ost(o).type">{{ ost(o).t }}</el-tag>',
      '        </div>',
      '        <div class="order-ops">',
      '          <el-button v-if="tab === \'buyer\' && o.status === 1" type="success" size="small" @click="act(o, \'complete\', \'确认已收到货？\')">确认收货</el-button>',
      '          <el-button v-if="tab === \'buyer\' && o.status === 2 && !o.reviewed" type="primary" size="small" @click="openReview(o)">评价</el-button>',
      '          <el-button v-if="tab === \'seller\' && o.status === 0" type="primary" size="small" @click="act(o, \'accept\', \'确认接单打单？\')">确认接单</el-button>',
      '          <el-button v-if="o.status === 0 || o.status === 1" type="danger" size="small" plain @click="act(o, \'cancel\', \'确认取消该订单？\')">取消订单</el-button>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <el-dialog v-model="reviewDlg" title="评价订单" width="420px">',
      '    <div style="margin-bottom:12px">',
      '      <span style="margin-right:10px">评分</span>',
      '      <el-rate v-model="reviewForm.rating" :max="5" style="display:inline-flex;vertical-align:middle"></el-rate>',
      '    </div>',
      '    <el-input v-model="reviewForm.content" type="textarea" :rows="3" placeholder="说说这次交易体验"></el-input>',
      '    <template #footer>',
      '      <el-button @click="reviewDlg = false">取消</el-button>',
      '      <el-button type="primary" :loading="reviewLoading" @click="submitReview">提交评价</el-button>',
      '    </template>',
      '  </el-dialog>',
      '</div>'
    ].join('\n'),
    data: function () {
      return {
        tab: 'buyer', buyer: [], seller: [], loading: false,
        reviewDlg: false, reviewForm: { orderId: null, rating: 5, content: '' }, reviewLoading: false
      };
    },
    computed: {
      list: function () { return this.tab === 'buyer' ? this.buyer : this.seller; }
    },
    mounted: function () { this.load(); },
    methods: {
      fmt: util.fmt, money: util.money, cover: util.cover,
      ost: function (o) { return ORDER_STATUS[o.status] || { t: '未知', type: 'info' }; },
      load: function () {
        var self = this;
        self.loading = true;
        api.get('/api/orders', { role: self.tab }).then(function (d) {
          if (self.tab === 'buyer') self.buyer = d || []; else self.seller = d || [];
          self.loading = false;
        }).catch(function () { self.loading = false; });
      },
      act: function (o, action, tip) {
        var self = this;
        ElementPlus.ElMessageBox.confirm(tip, '提示', { type: 'warning' }).then(function () {
          return api.put('/api/orders/' + o.id + '/' + action);
        }).then(function () {
          ok('操作成功');
          self.load();
        }).catch(function () {});
      },
      openReview: function (o) {
        this.reviewForm = { orderId: o.id, rating: 5, content: '' };
        this.reviewDlg = true;
      },
      submitReview: function () {
        if (!this.reviewForm.content) { warn('请填写评价内容'); return; }
        var self = this;
        self.reviewLoading = true;
        api.post('/api/reviews', this.reviewForm).then(function () {
          ok('评价成功');
          self.reviewDlg = false;
          self.reviewLoading = false;
          self.load();
        }).catch(function () { self.reviewLoading = false; });
      }
    }
  };

  /* ================= 个人中心 ================= */
  var CenterView = {
    props: ['query'],
    template: [
      '<div class="center-wrap">',
      '  <div class="center-side">',
      '    <el-menu :default-active="tab" @select="onMenu">',
      '      <el-menu-item index="publish"><el-icon><goods></goods></el-icon><span>我的发布</span></el-menu-item>',
      '      <el-menu-item index="fav"><el-icon><star></star></el-icon><span>我的收藏</span></el-menu-item>',
      '      <el-menu-item index="msg"><el-icon><chat-dot-round></chat-dot-round></el-icon><span>消息通知</span></el-menu-item>',
      '      <el-menu-item index="settings"><el-icon><setting></setting></el-icon><span>账号设置</span></el-menu-item>',
      '      <el-menu-item index="verify"><el-icon><circle-check></circle-check></el-icon><span>身份核验</span></el-menu-item>',
      '    </el-menu>',
      '  </div>',
      '  <div class="center-main">',
      '    <div v-if="tab === \'publish\'">',
      '      <el-table :data="mine" v-loading="loadingMine">',
      '        <el-table-column label="商品" min-width="200">',
      '          <template #default="s"><div style="display:flex;align-items:center;gap:8px"><img :src="cover(s.row.images)" class="table-img"><span>{{ s.row.title }}</span></div></template>',
      '        </el-table-column>',
      '        <el-table-column label="价格" width="100"><template #default="s">¥{{ money(s.row.price) }}</template></el-table-column>',
      '        <el-table-column prop="stock" label="库存" width="70"></el-table-column>',
      '        <el-table-column label="状态" width="90"><template #default="s"><el-tag :type="pst(s.row.status).type">{{ pst(s.row.status).t }}</el-tag></template></el-table-column>',
      '        <el-table-column prop="views" label="浏览" width="70"></el-table-column>',
      '        <el-table-column label="时间" width="150"><template #default="s">{{ fmt(s.row.createdAt) }}</template></el-table-column>',
      '        <el-table-column label="操作" width="170">',
      '          <template #default="s">',
      '            <el-button size="small" text type="primary" @click="go(\'#/publish?id=\' + s.row.id)">编辑</el-button>',
      '            <el-button v-if="s.row.status === 1" size="small" text type="warning" @click="offShelf(s.row)">下架</el-button>',
      '            <el-button v-if="s.row.status === 3" size="small" text type="success" @click="onShelf(s.row)">上架</el-button>',
      '          </template>',
      '        </el-table-column>',
      '        <template #empty><el-empty description="还没有发布商品"></el-empty></template>',
      '      </el-table>',
      '    </div>',
      '    <div v-if="tab === \'fav\'">',
      '      <div v-loading="loadingFav">',
      '        <el-empty v-if="!loadingFav && favs.length === 0" description="暂无收藏"></el-empty>',
      '        <div class="prod-grid">',
      '          <div class="prod-card" v-for="f in favs" :key="f.id">',
      '            <img class="prod-img" :src="cover(f.images)" @click="go(\'#/product?id=\' + f.productId)">',
      '            <div class="prod-body">',
      '              <div class="prod-title">{{ f.title }}</div>',
      '              <div class="prod-price">¥{{ money(f.price) }} <el-tag v-if="f.status !== 1" size="small" type="info">已失效</el-tag></div>',
      '              <el-button size="small" text type="danger" @click="unfav(f)">取消收藏</el-button>',
      '            </div>',
      '          </div>',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div v-if="tab === \'msg\'">',
      '      <div v-loading="loadingConv">',
      '        <el-empty v-if="!loadingConv && convs.length === 0" description="暂无消息"></el-empty>',
      '        <div v-for="c in convs" :key="c.otherId" class="conv-item" style="border-bottom:1px solid #f2f3f5" @click="go(\'#/chat?user=\' + c.otherId)">',
      '          <el-badge :value="c.unread" :hidden="!c.unread" :max="99">',
      '            <img :src="c.avatar || \'/img/seed/avatar3.svg\'" class="conv-avatar">',
      '          </el-badge>',
      '          <div style="flex:1;min-width:0">',
      '            <div class="conv-name">{{ c.name }}<span style="float:right;font-weight:400;color:#c0c4cc;font-size:12px">{{ fmt(c.createdAt) }}</span></div>',
      '            <div class="conv-last" style="max-width:none">{{ c.content }}</div>',
      '          </div>',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div v-if="tab === \'settings\'">',
      '      <el-form label-width="80px" style="max-width:460px">',
      '        <el-form-item label="头像">',
      '          <el-upload :show-file-list="false" accept="image/*" :http-request="upAvatar">',
      '            <img v-if="profile.avatar" :src="profile.avatar" style="width:64px;height:64px;border-radius:50%;object-fit:cover">',
      '            <el-button v-else>上传头像</el-button>',
      '          </el-upload>',
      '        </el-form-item>',
      '        <el-form-item label="昵称"><el-input v-model="profile.nickname"></el-input></el-form-item>',
      '        <el-form-item label="手机号"><el-input v-model="profile.phone"></el-input></el-form-item>',
      '        <el-form-item label="校区">',
      '          <el-select v-model="profile.campus" style="width:100%">',
      '            <el-option v-for="c in campuses" :key="c" :label="c" :value="c"></el-option>',
      '          </el-select>',
      '        </el-form-item>',
      '        <el-form-item><el-button type="primary" :loading="savingProfile" @click="saveProfile">保存资料</el-button></el-form-item>',
      '      </el-form>',
      '      <el-divider></el-divider>',
      '      <h4 style="margin:0 0 14px">修改密码</h4>',
      '      <el-form label-width="80px" style="max-width:460px">',
      '        <el-form-item label="原密码"><el-input v-model="pwd.oldPassword" type="password" show-password></el-input></el-form-item>',
      '        <el-form-item label="新密码"><el-input v-model="pwd.newPassword" type="password" show-password></el-input></el-form-item>',
      '        <el-form-item label="确认密码"><el-input v-model="pwd.confirm" type="password" show-password></el-input></el-form-item>',
      '        <el-form-item><el-button type="primary" :loading="savingPwd" @click="changePwd">修改密码</el-button></el-form-item>',
      '      </el-form>',
      '    </div>',
      '    <div v-if="tab === \'verify\'">',
      '      <el-result v-if="store.user && store.user.verified === 1" icon="success" title="已完成身份核验" sub-title="你的学号与校园邮箱已通过核验"></el-result>',
      '      <div v-else>',
      '        <el-alert type="info" :closable="false" title="填写学号与校园邮箱完成身份核验" style="margin-bottom:16px"></el-alert>',
      '        <el-form label-width="90px" style="max-width:460px">',
      '          <el-form-item label="学号"><el-input v-model="verifyForm.studentId"></el-input></el-form-item>',
      '          <el-form-item label="校园邮箱"><el-input v-model="verifyForm.email"></el-input></el-form-item>',
      '          <el-form-item><el-button type="primary" :loading="verifying" @click="submitVerify">提交核验</el-button></el-form-item>',
      '        </el-form>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n'),
    data: function () {
      return {
        store: store, campuses: CAMPUSES,
        tab: (this.query && this.query.tab) || 'publish',
        mine: [], favs: [], convs: [],
        loadingMine: false, loadingFav: false, loadingConv: false,
        profile: { nickname: '', avatar: '', phone: '', campus: '' }, savingProfile: false,
        pwd: { oldPassword: '', newPassword: '', confirm: '' }, savingPwd: false,
        verifyForm: { studentId: '', email: '' }, verifying: false
      };
    },
    mounted: function () {
      var self = this;
      function fill() {
        if (!store.user) return;
        self.profile = {
          nickname: store.user.nickname || '', avatar: store.user.avatar || '',
          phone: store.user.phone || '', campus: store.user.campus || ''
        };
        self.verifyForm = { studentId: store.user.studentId || '', email: store.user.email || '' };
      }
      if (store.user) fill(); else store.loadUser().then(fill);
      this.loadMine();
    },
    methods: {
      fmt: util.fmt, money: util.money, cover: util.cover,
      pst: function (s) { return PROD_STATUS[s] || { t: '未知', type: 'info' }; },
      go: function (h) { location.hash = h; },
      onMenu: function (key) {
        this.tab = key;
        if (key === 'publish') this.loadMine();
        else if (key === 'fav') this.loadFavs();
        else if (key === 'msg') this.loadConvs();
      },
      loadMine: function () {
        var self = this;
        self.loadingMine = true;
        api.get('/api/products/mine').then(function (d) {
          self.mine = d || [];
          self.loadingMine = false;
        }).catch(function () { self.loadingMine = false; });
      },
      offShelf: function (row) {
        var self = this;
        ElementPlus.ElMessageBox.confirm('确认下架该商品？', '提示', { type: 'warning' }).then(function () {
          return api.put('/api/products/' + row.id + '/offshelf');
        }).then(function () { ok('已下架'); self.loadMine(); }).catch(function () {});
      },
      onShelf: function (row) {
        var self = this;
        api.put('/api/products/' + row.id + '/onshelf').then(function () {
          ok('已重新上架');
          self.loadMine();
        }).catch(function () {});
      },
      loadFavs: function () {
        var self = this;
        self.loadingFav = true;
        api.get('/api/favorites').then(function (d) {
          self.favs = d || [];
          self.loadingFav = false;
        }).catch(function () { self.loadingFav = false; });
      },
      unfav: function (f) {
        var self = this;
        api.post('/api/favorites/' + f.productId).then(function () {
          ok('已取消收藏');
          self.loadFavs();
        }).catch(function () {});
      },
      loadConvs: function () {
        var self = this;
        self.loadingConv = true;
        api.get('/api/messages/conversations').then(function (d) {
          self.convs = d || [];
          self.loadingConv = false;
        }).catch(function () { self.loadingConv = false; });
      },
      upAvatar: function (param) {
        var self = this;
        api.upload(param.file).then(function (url) {
          self.profile.avatar = url;
          ok('头像已上传，点击保存生效');
        }).catch(function () {});
      },
      saveProfile: function () {
        var self = this;
        self.savingProfile = true;
        api.put('/api/user/profile', self.profile).then(function () {
          ok('资料已保存');
          self.savingProfile = false;
          store.loadUser();
        }).catch(function () { self.savingProfile = false; });
      },
      changePwd: function () {
        var p = this.pwd;
        if (!p.oldPassword || !p.newPassword) { warn('请填写密码'); return; }
        if (p.newPassword !== p.confirm) { warn('两次输入的新密码不一致'); return; }
        var self = this;
        self.savingPwd = true;
        api.put('/api/user/password', { oldPassword: p.oldPassword, newPassword: p.newPassword }).then(function () {
          ok('密码修改成功');
          self.pwd = { oldPassword: '', newPassword: '', confirm: '' };
          self.savingPwd = false;
        }).catch(function () { self.savingPwd = false; });
      },
      submitVerify: function () {
        var f = this.verifyForm;
        if (!f.studentId || !f.email) { warn('请填写学号和校园邮箱'); return; }
        var self = this;
        self.verifying = true;
        api.post('/api/auth/verify', f).then(function () {
          ok('核验成功');
          self.verifying = false;
          store.loadUser();
        }).catch(function () { self.verifying = false; });
      }
    }
  };

  window.UserViews = {
    HomeView: HomeView,
    ProductsView: ProductsView,
    ProductDetailView: ProductDetailView,
    PublishView: PublishView,
    LoginView: LoginView,
    RegisterView: RegisterView,
    ForgotView: ForgotView,
    ChatView: ChatView,
    OrdersView: OrdersView,
    CenterView: CenterView
  };
})();
