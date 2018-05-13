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
        `,

        // 根据需求1： “开发人员能够配置滑块运动的速度和高度”，
        // 在模块配置映射中保存收起和展开的时间和高度
        chat_extend_time: 1000,
        chat_retract_time: 300,
        chat_extend_height: 450,
        chat_retract_height: 15
    },
    // 将在整个模块中共享的动态信息放在 stateMap 变量中
    stateMap = { $container: null },
    // 将 jQuery集合缓存 在 jqueryMap 中
    jqueryMap = {},

    // 此部分声明所胡模块作用域内的变量。很多都是在之后赋值
    // 在模块作用域变量列表中，添加 toggleChat 方法
    setJqueryMap, toggleChat, initModule;
    // --------------- END MODULE SCOPE VARIABLES ----------------

    // ---------------- BEGIN UTILITY METHODS --------------------
    // ---------------- END UTILITY METHODS ----------------------

    // 将创建和操作页面元素的函数放在 "DOM Methods" 区块中
    // ---------------- BEGIN DOM METHODS --------------------
    // Begin DOM method /setJqueryMap/
    setJqueryMap = function () {
      var $container = stateMap.$container;

      // 将聊天滑块的 jQuery 集合缓存 到 jqueryMap 中
      jqueryMap = {
        $container: $container,
        $chat: $container.find('.spa-shell-chat')
      };
    };
    // 使用 setJqueryMap 来缓存 jQuery 集合。
    // 几乎我们编写的每个 Shell 和功能都应该在这个函数。
    // jqueryMap 缓存的用途是可以大大地减少 jQuery 对文档的遍历次数，能够提高性能。
    // End DOM method /setJqueryMap/
    //
    // Begin DOM method /toggleChat/
    // Purpose: Extends or retracts chat slider
    // Arguments:
    //  * do_extend - if true, extends slider; if false retracts
    //  * callback - optional function to execute at end of animation
    // Settings:
    //  * chat_extend_time, chat_retract_time
    //  * chat_extend_height, chat_retract_height
    // Returns: boolean
    //  * true - slider animation activated
    //  * false - slider animation not activated
    //
     toggleChat = function (do_extend, callback) {
      var
        px_chat_ht = jqueryMap.$chat.height(),
        is_open = px_chat_ht === configMap.chat_extend_height,
        is_closed = px_chat_ht === configMap.chat_retract_height,
        is_sliding = !is_open && !is_closed;

      // avoid race condition
      if (is_sliding) { return falise; }

      // begin extend chat slider
      if (do_extend) {
        jqueryMap.$chat.animate(
          { height: configMap.chat_extend_height },
          configMap.chat_extend_time,
          function () {
            if (callback) { callback(jqueryMap.$chat); }
          }
        );
        return true;
      }
      // End extend chat slider

      // Begin retract chat slider
      jqueryMap.$chat.animate(
        { height: configMap.chat_retract_height },
        configMap.chat_retract_time,
        function () {
          if (callback) { callback(jqueryMap.$chat); }
        }
      );
      return true;
      // End retract chat slider
     };
     // End DOM method /toggleChat/
    // ---------------- END DOM METHODS ----------------------

    // 为 jQuery 事件处理函数你保留的 “Event Handlers” 区块。
    // ---------------- BEGIN EVENT HANDLERS --------------------
    // ---------------- END EVENT HANDLERS ----------------------

    // 将公开方法放在 “Public Methods” 区块中。
    // ---------------- BEGIN PUBLIC METHODS --------------------
    // 创建 initModule 公开方法，用于初始化模块。
    // Begin Public method /initModule/
    initModule = function ($container) {
      // load HTML and map jQuery collections
      stateMap.$container = $container;
      $container.html(configMap.main_html);
      setJqueryMap();

      // test toggle
      // 根据需求5：创建测试代码，以便确认滑块功能正常，
      // 页面加载完后过3秒，展开滑块，过8秒后收起滑块。
      setTimeout(function() { toggleChat(true); }, 3000);
      setTimeout(function() { toggleChat(false); }, 8000);
    };
    // End PUBLIC method /initModule/
    // ---------------- END PUBLIC METHODS ----------------------

    // 显式地导出公开方法，以映射（map）的形式返回。目前可用的只有 initModule。
    return { initModule: initModule };
}());
