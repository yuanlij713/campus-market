/* 应用入口：hash 路由、顶部导航与启动 */
(function () {
  'use strict';

  var viewMap = {
    '/': UserViews.HomeView,
    '/products': UserViews.ProductsView,
    '/product': UserViews.ProductDetailView,
    '/publish': UserViews.PublishView,
    '/login': UserViews.LoginView,
    '/register': UserViews.RegisterView,
    '/forgot': UserViews.ForgotView,
    '/chat': UserViews.ChatView,
    '/orders': UserViews.OrdersView,
    '/center': UserViews.CenterView,
    '/admin': AdminViews.AdminDashboard,
    '/admin/review': AdminViews.AdminReview,
    '/admin/users': AdminViews.AdminUsers,
    '/admin/reports': AdminViews.AdminReports,
    '/admin/announcements': AdminViews.AdminAnnouncements,
    '/admin/categories': AdminViews.AdminCategories
  };
  var NEED_LOGIN = { '/publish': 1, '/orders': 1, '/center': 1, '/chat': 1 };

  var Root = {
    components: { 'admin-layout': AdminViews.AdminLayout },
    template: [
      '<div>',
      '  <admin-layout v-if="isAdmin" :view="currentView" :route="route"></admin-layout>',
      '  <template v-else>',
      '    <div class="topnav">',
      '      <div class="nav-inner">',
      '        <div class="nav-logo" @click="navigate(\'/\')">校园易淘</div>',
      '        <el-input v-model="keyword" class="nav-search" placeholder="搜索闲置好物" clearable @keyup.enter="goSearch">',
      '          <template #append><el-button @click="goSearch"><el-icon><search></search></el-icon></el-button></template>',
      '        </el-input>',
      '        <div class="nav-actions">',
      '          <el-button type="primary" @click="navigate(\'/publish\')"><el-icon><plus></plus></el-icon>发布商品</el-button>',
      '          <template v-if="store.user">',
      '            <el-badge :value="store.unread" :hidden="!store.unread" :max="99" style="cursor:pointer" @click="navigate(\'/chat\')">',
      '              <el-icon :size="20" style="vertical-align:middle"><bell></bell></el-icon>',
      '            </el-badge>',
      '            <el-dropdown trigger="click" @command="onUserCmd">',
      '              <span class="nav-user">{{ store.user.nickname }}<el-icon style="vertical-align:-2px"><arrow-down></arrow-down></el-icon></span>',
      '              <template #dropdown>',
      '                <el-dropdown-menu>',
      '                  <el-dropdown-item command="/center">个人中心</el-dropdown-item>',
      '                  <el-dropdown-item command="/orders">我的订单</el-dropdown-item>',
      '                  <el-dropdown-item v-if="store.user.role === 1" command="/admin">管理后台</el-dropdown-item>',
      '                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>',
      '                </el-dropdown-menu>',
      '              </template>',
      '            </el-dropdown>',
      '          </template>',
      '          <el-button v-else type="primary" plain @click="navigate(\'/login\')">登录 / 注册</el-button>',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div class="page-main">',
      '      <component :is="currentView" :query="query" :key="viewKey"></component>',
      '    </div>',
      '    <div class="page-footer">校园易淘 · 校园二手交易平台</div>',
      '  </template>',
      '</div>'
    ].join('\n'),
    data: function () {
      return { route: '/', query: {}, store: store, keyword: '' };
    },
    computed: {
      isAdmin: function () { return this.route.indexOf('/admin') === 0; },
      currentView: function () { return viewMap[this.route] || UserViews.HomeView; },
      viewKey: function () { return this.route + '|' + JSON.stringify(this.query); }
    },
    watch: {
      'store.token': function (v) { if (v) this.refreshUnread(); }
    },
    created: function () {
      window.addEventListener('hashchange', this.parseHash);
      this.parseHash();
      this.refreshUnread();
      this.timer = setInterval(this.refreshUnread, 15000);
    },
    unmounted: function () {
      window.removeEventListener('hashchange', this.parseHash);
      if (this.timer) clearInterval(this.timer);
    },
    methods: {
      parseHash: function () {
        var h = location.hash || '#/';
        var s = h.charAt(0) === '#' ? h.slice(1) : h;
        var qi = s.indexOf('?');
        var path = qi >= 0 ? s.slice(0, qi) : s;
        var qs = qi >= 0 ? s.slice(qi + 1) : '';
        if (!path) path = '/';
        var query = {};
        if (qs) {
          qs.split('&').forEach(function (kv) {
            var i = kv.indexOf('=');
            if (i < 0) {
              if (kv) query[decodeURIComponent(kv)] = '';
            } else {
              query[decodeURIComponent(kv.slice(0, i))] = decodeURIComponent(kv.slice(i + 1));
            }
          });
        }
        /* 路由守卫 */
        if (NEED_LOGIN[path] && !store.token) { location.hash = '#/login'; return; }
        if (path.indexOf('/admin') === 0) {
          if (!store.token) { location.hash = '#/login'; return; }
          if (!store.user || store.user.role !== 1) {
            ElementPlus.ElMessage.warning('无权访问管理后台');
            location.hash = '#/';
            return;
          }
        }
        this.route = path;
        this.query = query;
      },
      navigate: function (path) { location.hash = '#' + path; },
      goSearch: function () {
        var kw = this.keyword.trim();
        location.hash = '#/products' + (kw ? '?keyword=' + encodeURIComponent(kw) : '');
      },
      refreshUnread: function () {
        if (!store.token) { store.unread = 0; return; }
        api.get('/api/messages/unread-count').then(function (n) { store.unread = n; }).catch(function () {});
      },
      onUserCmd: function (cmd) {
        if (cmd === 'logout') { store.logout(); return; }
        this.navigate(cmd);
      }
    }
  };

  var app = Vue.createApp(Root);
  app.use(ElementPlus, { locale: ElementPlusLocaleZhCn });
  for (const [k, v] of Object.entries(ElementPlusIconsVue)) app.component(k, v);

  if (store.token) {
    store.loadUser().then(function () { app.mount('#app'); });
  } else {
    app.mount('#app');
  }
})();
