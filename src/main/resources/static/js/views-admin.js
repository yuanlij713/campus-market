/* 管理端视图组件，挂载到全局 AdminViews */
(function () {
  'use strict';

  var PROD_STATUS = {
    0: { t: '待审核', type: 'warning' },
    1: { t: '在售', type: 'success' },
    2: { t: '已拒绝', type: 'danger' },
    3: { t: '已下架', type: 'info' }
  };
  var REPORT_STATUS = {
    0: { t: '待处理', type: 'warning' },
    1: { t: '已处理', type: 'success' }
  };

  function ok(m) { ElementPlus.ElMessage.success(m); }
  function warn(m) { ElementPlus.ElMessage.warning(m); }
  function confirmBox(tip) {
    return ElementPlus.ElMessageBox.confirm(tip, '提示', { type: 'warning' });
  }

  /* ================= 后台布局 ================= */
  var AdminLayout = {
    props: ['view', 'route'],
    template: [
      '<div class="admin-wrap">',
      '  <div class="admin-side" style="display:flex;flex-direction:column">',
      '    <div class="admin-logo">校园易淘 · 管理后台</div>',
      '    <el-menu :default-active="route" background-color="#001529" text-color="rgba(255,255,255,.72)" active-text-color="#ffffff" style="flex:1" @select="onSelect">',
      '      <el-menu-item index="/admin"><el-icon><data-analysis></data-analysis></el-icon><span>数据看板</span></el-menu-item>',
      '      <el-menu-item index="/admin/review"><el-icon><checked></checked></el-icon><span>商品审核</span></el-menu-item>',
      '      <el-menu-item index="/admin/users"><el-icon><user></user></el-icon><span>用户管理</span></el-menu-item>',
      '      <el-menu-item index="/admin/reports"><el-icon><warning></warning></el-icon><span>举报处理</span></el-menu-item>',
      '      <el-menu-item index="/admin/announcements"><el-icon><bell></bell></el-icon><span>公告管理</span></el-menu-item>',
      '      <el-menu-item index="/admin/categories"><el-icon><files></files></el-icon><span>分类管理</span></el-menu-item>',
      '    </el-menu>',
      '    <div style="padding:14px 16px;border-top:1px solid rgba(255,255,255,.12)">',
      '      <a style="color:rgba(255,255,255,.72);cursor:pointer;font-size:13px" @click="goFront"><el-icon style="vertical-align:-2px"><back></back></el-icon> 返回前台</a>',
      '    </div>',
      '  </div>',
      '  <div class="admin-main">',
      '    <component :is="view"></component>',
      '  </div>',
      '</div>'
    ].join('\n'),
    methods: {
      onSelect: function (key) { location.hash = '#' + key; },
      goFront: function () { location.hash = '#/'; }
    }
  };

  /* ================= 数据看板 ================= */
  var AdminDashboard = {
    template: [
      '<div>',
      '  <div class="stat-cards">',
      '    <div class="stat-card"><div class="stat-num">{{ stats.userCount || 0 }}</div><div class="stat-label">用户总数</div></div>',
      '    <div class="stat-card"><div class="stat-num">{{ stats.productCount || 0 }}</div><div class="stat-label">商品总数</div></div>',
      '    <div class="stat-card"><div class="stat-num">{{ stats.orderCount || 0 }}</div><div class="stat-label">订单总数</div></div>',
      '    <div class="stat-card"><div class="stat-num">¥{{ money(stats.orderAmount) }}</div><div class="stat-label">交易总额</div></div>',
      '    <div class="stat-card"><div class="stat-num" style="color:#e6a23c">{{ stats.pendingProductCount || 0 }}</div><div class="stat-label">待审核商品</div></div>',
      '    <div class="stat-card"><div class="stat-num" style="color:#f56c6c">{{ stats.pendingReportCount || 0 }}</div><div class="stat-label">待处理举报</div></div>',
      '  </div>',
      '  <div class="chart-row">',
      '    <div class="chart-box"><h4>近期订单趋势</h4><div ref="trendChart" class="chart"></div></div>',
      '    <div class="chart-box"><h4>商品分类分布</h4><div ref="pieChart" class="chart"></div></div>',
      '  </div>',
      '  <div class="chart-box"><h4>各校区商品分布</h4><div ref="barChart" class="chart" style="height:260px"></div></div>',
      '</div>'
    ].join('\n'),
    data: function () {
      return { stats: {}, trend: null };
    },
    created: function () { this._charts = []; },
    mounted: function () {
      var self = this;
      api.get('/api/admin/stats').then(function (d) { self.stats = d || {}; }).catch(function () {});
      api.get('/api/admin/stats/trend').then(function (d) {
        self.trend = d || {};
        self.$nextTick(function () { self.renderCharts(); });
      }).catch(function () {});
      window.addEventListener('resize', this.onResize);
    },
    unmounted: function () {
      window.removeEventListener('resize', this.onResize);
      this._charts.forEach(function (c) { c.dispose(); });
      this._charts = [];
    },
    methods: {
      money: util.money,
      onResize: function () {
        this._charts.forEach(function (c) { c.resize(); });
      },
      renderCharts: function () {
        var t = this.trend || {};
        var trend = t.orderTrend || [];
        var cat = t.categoryDist || [];
        var campus = t.campusDist || [];
        var self = this;
        function make(ref) {
          var el = self.$refs[ref];
          if (!el) return null;
          var c = echarts.init(el);
          self._charts.push(c);
          return c;
        }
        var c1 = make('trendChart');
        if (c1) {
          c1.setOption({
            tooltip: { trigger: 'axis' },
            grid: { left: 44, right: 20, top: 34, bottom: 30 },
            xAxis: { type: 'category', data: trend.map(function (x) { return x.day; }) },
            yAxis: { type: 'value', minInterval: 1 },
            series: [{
              name: '订单量', type: 'line', smooth: true, areaStyle: { opacity: 0.15 },
              itemStyle: { color: '#409eff' },
              data: trend.map(function (x) { return x.cnt; })
            }]
          });
        }
        var c2 = make('pieChart');
        if (c2) {
          c2.setOption({
            tooltip: { trigger: 'item' },
            legend: { bottom: 0 },
            series: [{
              type: 'pie', radius: ['38%', '66%'], center: ['50%', '44%'],
              label: { formatter: '{b}' },
              data: cat.map(function (x) { return { name: x.name, value: x.cnt }; })
            }]
          });
        }
        var c3 = make('barChart');
        if (c3) {
          c3.setOption({
            tooltip: {},
            grid: { left: 44, right: 20, top: 30, bottom: 30 },
            xAxis: { type: 'category', data: campus.map(function (x) { return x.name; }) },
            yAxis: { type: 'value', minInterval: 1 },
            series: [{
              name: '商品数', type: 'bar', barMaxWidth: 48,
              itemStyle: { color: '#409eff', borderRadius: [4, 4, 0, 0] },
              data: campus.map(function (x) { return x.cnt; })
            }]
          });
        }
      }
    }
  };

  /* ================= 商品审核 ================= */
  var AdminReview = {
    template: [
      '<div class="table-card">',
      '  <el-tabs v-model="tab" @tab-change="onTab">',
      '    <el-tab-pane label="全部" name=""></el-tab-pane>',
      '    <el-tab-pane label="待审核" name="0"></el-tab-pane>',
      '    <el-tab-pane label="在售" name="1"></el-tab-pane>',
      '    <el-tab-pane label="已拒绝" name="2"></el-tab-pane>',
      '    <el-tab-pane label="已下架" name="3"></el-tab-pane>',
      '  </el-tabs>',
      '  <div class="table-toolbar">',
      '    <el-input v-model="keyword" placeholder="搜索商品标题" clearable style="width:240px" @keyup.enter="search"></el-input>',
      '    <el-button type="primary" @click="search"><el-icon><search></search></el-icon>搜索</el-button>',
      '  </div>',
      '  <el-table :data="list" v-loading="loading">',
      '    <el-table-column label="封面" width="80">',
      '      <template #default="s"><img :src="cover(s.row.images)" class="table-img"></template>',
      '    </el-table-column>',
      '    <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip></el-table-column>',
      '    <el-table-column prop="sellerName" label="卖家" width="110"></el-table-column>',
      '    <el-table-column label="价格" width="90"><template #default="s">¥{{ money(s.row.price) }}</template></el-table-column>',
      '    <el-table-column prop="categoryName" label="分类" width="100"></el-table-column>',
      '    <el-table-column label="状态" width="90">',
      '      <template #default="s"><el-tag :type="pst(s.row.status).type">{{ pst(s.row.status).t }}</el-tag></template>',
      '    </el-table-column>',
      '    <el-table-column label="发布时间" width="150"><template #default="s">{{ fmt(s.row.createdAt) }}</template></el-table-column>',
      '    <el-table-column label="操作" width="150" fixed="right">',
      '      <template #default="s">',
      '        <template v-if="s.row.status === 0">',
      '          <el-button size="small" type="success" @click="approve(s.row)">通过</el-button>',
      '          <el-button size="small" type="danger" @click="reject(s.row)">拒绝</el-button>',
      '        </template>',
      '        <el-button v-if="s.row.status === 1" size="small" type="warning" @click="offshelf(s.row)">下架</el-button>',
      '      </template>',
      '    </el-table-column>',
      '    <template #empty><el-empty description="暂无商品"></el-empty></template>',
      '  </el-table>',
      '  <div class="pager">',
      '    <el-pagination background layout="prev, pager, next, total" :total="total" :page-size="size" :current-page="page" @current-change="onPage"></el-pagination>',
      '  </div>',
      '</div>'
    ].join('\n'),
    data: function () {
      return { tab: '', keyword: '', list: [], total: 0, page: 1, size: 10, loading: false };
    },
    mounted: function () { this.load(); },
    methods: {
      fmt: util.fmt, money: util.money, cover: util.cover,
      pst: function (s) { return PROD_STATUS[s] || { t: '未知', type: 'info' }; },
      load: function () {
        var self = this;
        var params = { keyword: this.keyword, page: this.page, size: this.size };
        if (this.tab !== '') params.status = Number(this.tab);
        self.loading = true;
        api.get('/api/admin/products', params).then(function (d) {
          self.list = d.list || [];
          self.total = d.total || 0;
          self.loading = false;
        }).catch(function () { self.loading = false; });
      },
      onTab: function () { this.page = 1; this.load(); },
      search: function () { this.page = 1; this.load(); },
      onPage: function (p) { this.page = p; this.load(); },
      approve: function (row) {
        var self = this;
        confirmBox('确认通过该商品的审核？').then(function () {
          return api.put('/api/admin/products/' + row.id + '/approve');
        }).then(function () { ok('已通过审核'); self.load(); }).catch(function () {});
      },
      reject: function (row) {
        var self = this;
        confirmBox('确认拒绝该商品？').then(function () {
          return api.put('/api/admin/products/' + row.id + '/reject');
        }).then(function () { ok('已拒绝'); self.load(); }).catch(function () {});
      },
      offshelf: function (row) {
        var self = this;
        confirmBox('确认下架该商品？').then(function () {
          return api.put('/api/admin/products/' + row.id + '/offshelf');
        }).then(function () { ok('已下架'); self.load(); }).catch(function () {});
      }
    }
  };

  /* ================= 用户管理 ================= */
  var AdminUsers = {
    template: [
      '<div class="table-card">',
      '  <div class="table-toolbar">',
      '    <el-input v-model="keyword" placeholder="搜索用户名 / 昵称 / 学号" clearable style="width:240px" @keyup.enter="search"></el-input>',
      '    <el-button type="primary" @click="search"><el-icon><search></search></el-icon>搜索</el-button>',
      '  </div>',
      '  <el-table :data="list" v-loading="loading">',
      '    <el-table-column prop="username" label="用户名" width="110"></el-table-column>',
      '    <el-table-column prop="nickname" label="昵称" width="110"></el-table-column>',
      '    <el-table-column prop="studentId" label="学号" width="110"></el-table-column>',
      '    <el-table-column prop="email" label="邮箱" min-width="170" show-overflow-tooltip></el-table-column>',
      '    <el-table-column prop="campus" label="校区" width="90"></el-table-column>',
      '    <el-table-column label="角色" width="86">',
      '      <template #default="s"><el-tag :type="s.row.role === 1 ? \'danger\' : \'info\'">{{ s.row.role === 1 ? \'管理员\' : \'用户\' }}</el-tag></template>',
      '    </el-table-column>',
      '    <el-table-column label="核验" width="86">',
      '      <template #default="s">',
      '        <el-tag v-if="s.row.verified === 1" type="success" size="small">已核验</el-tag>',
      '        <el-tag v-else type="info" size="small">未核验</el-tag>',
      '      </template>',
      '    </el-table-column>',
      '    <el-table-column label="状态" width="86">',
      '      <template #default="s"><el-tag :type="s.row.status === 1 ? \'success\' : \'danger\'">{{ s.row.status === 1 ? \'正常\' : \'已封禁\' }}</el-tag></template>',
      '    </el-table-column>',
      '    <el-table-column label="注册时间" width="150"><template #default="s">{{ fmt(s.row.createdAt) }}</template></el-table-column>',
      '    <el-table-column label="操作" width="90" fixed="right">',
      '      <template #default="s">',
      '        <template v-if="s.row.role !== 1">',
      '          <el-button v-if="s.row.status === 1" size="small" type="danger" @click="ban(s.row)">封禁</el-button>',
      '          <el-button v-else size="small" type="success" @click="unban(s.row)">解封</el-button>',
      '        </template>',
      '      </template>',
      '    </el-table-column>',
      '    <template #empty><el-empty description="暂无用户"></el-empty></template>',
      '  </el-table>',
      '  <div class="pager">',
      '    <el-pagination background layout="prev, pager, next, total" :total="total" :page-size="size" :current-page="page" @current-change="onPage"></el-pagination>',
      '  </div>',
      '</div>'
    ].join('\n'),
    data: function () {
      return { keyword: '', list: [], total: 0, page: 1, size: 10, loading: false };
    },
    mounted: function () { this.load(); },
    methods: {
      fmt: util.fmt,
      load: function () {
        var self = this;
        self.loading = true;
        api.get('/api/admin/users', { keyword: this.keyword, page: this.page, size: this.size }).then(function (d) {
          self.list = d.list || [];
          self.total = d.total || 0;
          self.loading = false;
        }).catch(function () { self.loading = false; });
      },
      search: function () { this.page = 1; this.load(); },
      onPage: function (p) { this.page = p; this.load(); },
      ban: function (row) {
        var self = this;
        confirmBox('确认封禁用户「' + (row.nickname || row.username) + '」？').then(function () {
          return api.put('/api/admin/users/' + row.id + '/ban');
        }).then(function () { ok('已封禁'); self.load(); }).catch(function () {});
      },
      unban: function (row) {
        var self = this;
        api.put('/api/admin/users/' + row.id + '/unban').then(function () {
          ok('已解封');
          self.load();
        }).catch(function () {});
      }
    }
  };

  /* ================= 举报处理 ================= */
  var AdminReports = {
    template: [
      '<div class="table-card">',
      '  <el-table :data="list" v-loading="loading">',
      '    <el-table-column prop="reporterName" label="举报人" width="110"></el-table-column>',
      '    <el-table-column prop="productTitle" label="被举报商品" min-width="150" show-overflow-tooltip></el-table-column>',
      '    <el-table-column prop="reason" label="举报原因" min-width="180" show-overflow-tooltip></el-table-column>',
      '    <el-table-column label="状态" width="90">',
      '      <template #default="s"><el-tag :type="rst(s.row.status).type">{{ rst(s.row.status).t }}</el-tag></template>',
      '    </el-table-column>',
      '    <el-table-column label="处理结果" min-width="140" show-overflow-tooltip>',
      '      <template #default="s">{{ s.row.handleResult || \'—\' }}</template>',
      '    </el-table-column>',
      '    <el-table-column label="举报时间" width="150"><template #default="s">{{ fmt(s.row.createdAt) }}</template></el-table-column>',
      '    <el-table-column label="操作" width="90" fixed="right">',
      '      <template #default="s">',
      '        <el-button v-if="s.row.status === 0" size="small" type="primary" @click="openHandle(s.row)">处理</el-button>',
      '      </template>',
      '    </el-table-column>',
      '    <template #empty><el-empty description="暂无举报"></el-empty></template>',
      '  </el-table>',
      '  <el-dialog v-model="dlg" title="处理举报" width="440px">',
      '    <el-form label-width="90px">',
      '      <el-form-item label="处理结果" required>',
      '        <el-input v-model="form.result" type="textarea" :rows="3" placeholder="填写处理说明"></el-input>',
      '      </el-form-item>',
      '      <el-form-item label=" ">',
      '        <el-checkbox v-model="form.takedown">同时下架该商品</el-checkbox>',
      '      </el-form-item>',
      '    </el-form>',
      '    <template #footer>',
      '      <el-button @click="dlg = false">取消</el-button>',
      '      <el-button type="primary" :loading="saving" @click="submitHandle">提交</el-button>',
      '    </template>',
      '  </el-dialog>',
      '</div>'
    ].join('\n'),
    data: function () {
      return {
        list: [], loading: false,
        dlg: false, form: { id: null, result: '', takedown: false }, saving: false
      };
    },
    mounted: function () { this.load(); },
    methods: {
      fmt: util.fmt,
      rst: function (s) { return REPORT_STATUS[s] || { t: '未知', type: 'info' }; },
      load: function () {
        var self = this;
        self.loading = true;
        api.get('/api/admin/reports').then(function (d) {
          self.list = d || [];
          self.loading = false;
        }).catch(function () { self.loading = false; });
      },
      openHandle: function (row) {
        this.form = { id: row.id, result: '', takedown: false };
        this.dlg = true;
      },
      submitHandle: function () {
        if (!this.form.result) { warn('请填写处理结果'); return; }
        var self = this;
        self.saving = true;
        api.put('/api/admin/reports/' + self.form.id + '/handle', {
          result: self.form.result,
          takedown: self.form.takedown
        }).then(function () {
          ok('处理完成');
          self.dlg = false;
          self.saving = false;
          self.load();
        }).catch(function () { self.saving = false; });
      }
    }
  };

  /* ================= 公告管理 ================= */
  var AdminAnnouncements = {
    template: [
      '<div class="table-card">',
      '  <div class="table-toolbar">',
      '    <el-button type="primary" @click="openEdit(null)"><el-icon><plus></plus></el-icon>新建公告</el-button>',
      '  </div>',
      '  <el-table :data="list" v-loading="loading">',
      '    <el-table-column prop="title" label="标题" width="200" show-overflow-tooltip></el-table-column>',
      '    <el-table-column prop="content" label="内容" min-width="260" show-overflow-tooltip></el-table-column>',
      '    <el-table-column label="发布时间" width="160"><template #default="s">{{ fmt(s.row.createdAt) }}</template></el-table-column>',
      '    <el-table-column label="操作" width="130" fixed="right">',
      '      <template #default="s">',
      '        <el-button size="small" text type="primary" @click="openEdit(s.row)">编辑</el-button>',
      '        <el-button size="small" text type="danger" @click="del(s.row)">删除</el-button>',
      '      </template>',
      '    </el-table-column>',
      '    <template #empty><el-empty description="暂无公告"></el-empty></template>',
      '  </el-table>',
      '  <el-dialog v-model="dlg" :title="form.id ? \'编辑公告\' : \'新建公告\'" width="480px">',
      '    <el-form label-width="60px">',
      '      <el-form-item label="标题" required>',
      '        <el-input v-model="form.title" maxlength="50" show-word-limit></el-input>',
      '      </el-form-item>',
      '      <el-form-item label="内容" required>',
      '        <el-input v-model="form.content" type="textarea" :rows="5" maxlength="500" show-word-limit></el-input>',
      '      </el-form-item>',
      '    </el-form>',
      '    <template #footer>',
      '      <el-button @click="dlg = false">取消</el-button>',
      '      <el-button type="primary" :loading="saving" @click="save">保存</el-button>',
      '    </template>',
      '  </el-dialog>',
      '</div>'
    ].join('\n'),
    data: function () {
      return {
        list: [], loading: false,
        dlg: false, form: { id: null, title: '', content: '' }, saving: false
      };
    },
    mounted: function () { this.load(); },
    methods: {
      fmt: util.fmt,
      load: function () {
        var self = this;
        self.loading = true;
        api.get('/api/admin/announcements').then(function (d) {
          self.list = d || [];
          self.loading = false;
        }).catch(function () { self.loading = false; });
      },
      openEdit: function (row) {
        this.form = row ? { id: row.id, title: row.title, content: row.content } : { id: null, title: '', content: '' };
        this.dlg = true;
      },
      save: function () {
        var f = this.form;
        if (!f.title || !f.content) { warn('请填写标题和内容'); return; }
        var self = this;
        self.saving = true;
        var p = f.id
          ? api.put('/api/admin/announcements/' + f.id, { title: f.title, content: f.content })
          : api.post('/api/admin/announcements', { title: f.title, content: f.content });
        p.then(function () {
          ok('保存成功');
          self.dlg = false;
          self.saving = false;
          self.load();
        }).catch(function () { self.saving = false; });
      },
      del: function (row) {
        var self = this;
        confirmBox('确认删除该公告？').then(function () {
          return api.del('/api/admin/announcements/' + row.id);
        }).then(function () { ok('已删除'); self.load(); }).catch(function () {});
      }
    }
  };

  /* ================= 分类管理 ================= */
  var AdminCategories = {
    template: [
      '<div class="table-card">',
      '  <div class="table-toolbar">',
      '    <el-button type="primary" @click="openEdit(null)"><el-icon><plus></plus></el-icon>新建分类</el-button>',
      '  </div>',
      '  <el-table :data="list" v-loading="loading">',
      '    <el-table-column prop="id" label="ID" width="80"></el-table-column>',
      '    <el-table-column prop="name" label="名称" min-width="160"></el-table-column>',
      '    <el-table-column prop="sort" label="排序" width="90"></el-table-column>',
      '    <el-table-column label="操作" width="130" fixed="right">',
      '      <template #default="s">',
      '        <el-button size="small" text type="primary" @click="openEdit(s.row)">编辑</el-button>',
      '        <el-button size="small" text type="danger" @click="del(s.row)">删除</el-button>',
      '      </template>',
      '    </el-table-column>',
      '    <template #empty><el-empty description="暂无分类"></el-empty></template>',
      '  </el-table>',
      '  <el-dialog v-model="dlg" :title="form.id ? \'编辑分类\' : \'新建分类\'" width="440px">',
      '    <el-form label-width="70px">',
      '      <el-form-item label="名称" required>',
      '        <el-input v-model="form.name" maxlength="20"></el-input>',
      '      </el-form-item>',
      '      <el-form-item label="父分类">',
      '        <el-select v-model="form.parentId" style="width:100%">',
      '          <el-option label="作为顶级分类" :value="0"></el-option>',
      '          <el-option v-for="c in topCats" :key="c.id" :label="c.name" :value="c.id"></el-option>',
      '        </el-select>',
      '      </el-form-item>',
      '      <el-form-item label="排序">',
      '        <el-input-number v-model="form.sort" :min="0" :max="9999"></el-input-number>',
      '      </el-form-item>',
      '    </el-form>',
      '    <template #footer>',
      '      <el-button @click="dlg = false">取消</el-button>',
      '      <el-button type="primary" :loading="saving" @click="save">保存</el-button>',
      '    </template>',
      '  </el-dialog>',
      '</div>'
    ].join('\n'),
    data: function () {
      return {
        list: [], loading: false,
        dlg: false, form: { id: null, name: '', parentId: 0, sort: 0 }, saving: false
      };
    },
    computed: {
      topCats: function () {
        var self = this;
        return this.list.filter(function (c) { return !c.parentId && c.id !== self.form.id; });
      }
    },
    mounted: function () { this.load(); },
    methods: {
      load: function () {
        var self = this;
        self.loading = true;
        api.get('/api/admin/categories').then(function (d) {
          self.list = d || [];
          self.loading = false;
        }).catch(function () { self.loading = false; });
      },
      openEdit: function (row) {
        this.form = row
          ? { id: row.id, name: row.name, parentId: row.parentId || 0, sort: row.sort || 0 }
          : { id: null, name: '', parentId: 0, sort: 0 };
        this.dlg = true;
      },
      save: function () {
        var f = this.form;
        if (!f.name) { warn('请填写分类名称'); return; }
        var self = this;
        self.saving = true;
        var body = { name: f.name, parentId: f.parentId, sort: f.sort };
        var p = f.id ? api.put('/api/admin/categories/' + f.id, body) : api.post('/api/admin/categories', body);
        p.then(function () {
          ok('保存成功');
          self.dlg = false;
          self.saving = false;
          self.load();
        }).catch(function () { self.saving = false; });
      },
      del: function (row) {
        var self = this;
        confirmBox('确认删除分类「' + row.name + '」？').then(function () {
          return api.del('/api/admin/categories/' + row.id);
        }).then(function () { ok('已删除'); self.load(); }).catch(function () {});
      }
    }
  };

  window.AdminViews = {
    AdminLayout: AdminLayout,
    AdminDashboard: AdminDashboard,
    AdminReview: AdminReview,
    AdminUsers: AdminUsers,
    AdminReports: AdminReports,
    AdminAnnouncements: AdminAnnouncements,
    AdminCategories: AdminCategories
  };
})();
