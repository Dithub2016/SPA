/*
 * spa.shell.js
 * Shell module for SPA
 */

/* jslint
  browser: true,
  continue: true,
  devel: true,
  indent: 2,
  maxerr: 50,
  newcap: true,
  nomen: true,
  plusplus: true,
  regexp: true,
  sloppy: true,
  vars: false,
  white: true
*/
/* global $, spa */

spa.shell = (function () {
  // 声明所有在名字空间（即 "Module Scope" 区块，这里是 spa.shell）内可用的变量。
  // 请查看附录 A 关于这个的完整讨论和模板的其他部分
  // ---------------- GEGIN MODULE SCOPE VARIABLES -----------------
  var
    configMap = {
      main_html: String()
        + `
            <div class="spa-shell-head">
              <div class="spa-shell-head-logo"></div>
              <div class="spa-shell-head-acct"></div>
              <div class="spa-shell-head-search"></div>
            </div>
            <!-- 将导航（nav）和 content 容器放在主容器里面 -->
            <div class="spa-shell-main">
              <div class="spa-shell-main-nav"></div>
              <div class="spa-shell-main-content"></div>
            </div>
            <!-- 创建 footer 容器 -->
            <div class="spa-shell-foot"></div>
            <!-- 将 chat 容器固定在外部容器的右下角 -->
            <div class="spa-shell-chat"></div>
            <!-- 创建 modal 容器，漂浮在其他内容的上面 -->
            <div class="spa-shell-modal"></div>
        `
    },
    // 将在整个模块中共享的动态信息放在 stateMap 变量中
    stateMap = { $container: null },
    // 将 jQuery集合缓存 在 jqueryMap 中
    jqueryMap = {},

    // 此部分声明所胡模块作用域内的变量。很多都是在之后赋值
    setJqueryMap, initModule;
    // --------------- END MODULE SCOPE VARIABLES ----------------

    // ---------------- BEGIN UTILITY METHODS --------------------
    // ---------------- END UTILITY METHODS ----------------------

    // 将创建和操作页面元素的函数放在 "DOM Methods" 区块中
    // ---------------- BEGIN DOM METHODS --------------------
    // Begin DOM method /setJqueryMap/
    setJqueryMap = function () {
      var $container = stateMap.$container;
      jqueryMap = { $container: $container };
    };
    // 使用 setJqueryMap 来缓存 jQuery 集合。
    // 几乎我们编写的每个 Shell 和功能都应该在这个函数。
    // jqueryMap 缓存的用途是可以大大地减少 jQuery 对文档的遍历次数，能够提高性能。
    // ---------------- END DOM METHODS ----------------------

    // 为 jQuery 事件处理函数你保留的 “Event Handlers” 区块。
    // ---------------- BEGIN EVENT HANDLERS --------------------
    // ---------------- END EVENT HANDLERS ----------------------

    // 将公开方法放在 “Public Methods” 区块中。
    // ---------------- BEGIN PUBLIC METHODS --------------------
    // 创建 initModule 公开方法，用于初始化模块。
    initModule = function ($container) {
      stateMap.$container = $container;
      $container.html(configMap.main_html);
      setJqueryMap();
    };
    // ---------------- END PUBLIC METHODS ----------------------

    // 显式地导出公开方法，以映射（map）的形式返回。目前可用的只有 initModule。
    return { initModule: initModule };
}());
