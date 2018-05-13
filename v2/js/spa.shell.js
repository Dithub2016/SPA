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
      anchor_schema_map: {
        chat: { open: true, closed: true }
      },
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
        chat_extend_time: 250,
        chat_retract_time: 300,
        chat_extend_height: 450,
        chat_retract_height: 15,
        chat_extended_title: 'Click to retract',
        chat_retracted_title: 'Click to extend'
    },
    // 将在整个模块中共享的动态信息放在 stateMap 变量中
    stateMap = {
      $container: null,
      anchor_map: {},
      is_chat_retracted: true
    },
    // 将 jQuery集合缓存 在 jqueryMap 中
    jqueryMap = {},

    // 此部分声明所胡模块作用域内的变量。很多都是在之后赋值
    // 在模块作用域变量列表中，添加 toggleChat 方法
    copyAnchorMap, setJqueryMap, toggleChat,
    changeAnchorPart, onHashchange,
    onClickChat, initModule;
    // --------------- END MODULE SCOPE VARIABLES ----------------

    // ---------------- BEGIN UTILITY METHODS --------------------
    // Returns conpy of stored anchor map; minimizes overhead
    copyAnchorMap = function () {
      return $.extend(true, {}, stateMap.anchor_map);
    }
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

    // begin DOM method /changeAnchorPart/
    // Purpose: Changes part of the URI anchor component
    // Arguments:
    //  * arg_map - The map describing what part of the URI anchor
    //              we want changed.
    // Returns: boolean
    //  * true - the Anchor portion of the URI was update
    //  * false - the Anchor portion of the URI could not be updated
    // Action:
    //  The current anchor rep stored in stateMap.anchor_map.
    //  See uriAnchor for a discussion of encoding.
    //  This method
    //   * Creates a copy of this mpa using copyAnchorMap().
    //   * modifies the key-values using arg_map.
    //   * Manages the distinction between independent
    //     and dependent values in the encoding.
    //    * Attempts to change the URI using uriAnchor.
    //    * Returns true on success, and false on failure.
     changeAnchorPart = function (arg_map) {
       var
        anchor_map_revise = copyAnchorMap(),
        bool_return = true,
        key_name, key_name_dep;

      // Begin merge changes into anchor map
      KEYVAL:
      for (key_name in arg_map) {
        if (arg_map.hasOwnProperty(key_name)) {

          // skip dependent keys during iteration
          if (key_name.indexOf('_') === 0) { continue KEYVAL; }

          // update independent key value
          anchor_map_revise[key_name] = arg_map[key_name];

          // update matching dependent key
          // key_name_dep = '_' + key_name;
          if (arg_map[key_name_dep]) {
            anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
          }
          else {
            delete anchor_map_revise[key_name_dep];
            delete anchor_map_revise['_s' + key_name_dep];
          }
        }
      }
      // End merge changes into anchor map

      // Begin attempt to update URI; revert if not successful
      try {
        $.uriAnchor.setAnchor(anchor_map_revise);
      }
      catch (error) {
        // replace URI with existing state
        $.uriAnchor.setAnchor(stateMap.anchor_map, null, true)
        bool_return = false;
      }
      // End attempt tot update URI...
      //
      return bool_return;
     }
     // End DOM method /changeAnchorPart/
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
            jqueryMap.$chat.attr(
              'title', configMap.chat_extended_title
            );
            stateMap.is_chat_retracted = false;
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
          jqueryMap.$chat.attr(
            'title', configMap.chat_retracted_title
          );
          stateMap.is_chat_retracted = true;
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
    // Begin Event handler /onHashchange/
    // purpose: Handles the hashchange event
    // Arguments:
    //  * event - jquery event object.
    // Settings: none
    // Retrun: false
    // Action:
    //  * Parses the URI anchor component
    //  * Compares proposed application state with current
    //  * Adjust the application only where proposed state
    //    differs form existing
    onHashchange = function (event) {
      var
        anchor_map_previous = copyAnchorMap(),
        anchor_map_proposed,
        _s_chat_previous, _s_chat_proposed,
        s_chat_proposed;

      // attempt to parse anchor
      try { anchor_map_proposed = $.uriAnchor.makeAnchorMap(); }
      catch (error) {
        $.uriAnchor.setAnchor(anchor_map_previous, null, true);
        return false;
      }
      stateMap.anchor_map = anchor_map_proposed;

      // convenience vars
      _s_chat_previous = anchor_map_previous._s_chat;
      _s_chat_proposed = anchor_map_proposed._s_chat;

      // Begin adjust chat component if changed
      if (!anchor_map_previous
        || _s_chat_previous !== _s_chat_proposed
      ) {
        s_chat_proposed = anchor_map_proposed.chat;
        switch (s_chat_proposed) {
          case 'open':
            toggleChat(true);
            break;
          case 'closed':
            toggleChat(false);
            break;
          default:
            toggleChat(false);
            delete anchor_map_proposed.chat;
            $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
        }
      }
      // End adjust chat component if changed
      //
      return false;
    }

    // Begin Event handler /onClickChat/
    onClickChat = function (event) {
      changeAnchorPart({
        chat: (stateMap.is_chat_retracted ? 'open' : 'closed')
      });
      return false;
    }
    // End Event handler /onClickChat/
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

      // initialize chat slider and bind click handler
      stateMap.is_chat_retracted = true;
      jqueryMap.$chat
        .attr('tilte', configMap.chat_retracted_title)
        .click(onClickChat);

      // configure uriAnchor to use our schema
      $.uriAnchor.configModule({
        schema_map: configMap.anchor_schema_map
      });

      // Handle URI anchor change events.
      // This is done /after/ all feature modules are configured
      // and trigger event, which is used to ensure the anchor
      // is considered on-load
      $(window)
        .bind('hashchange', onHashchange)
        .trigger('hashchange');
    };
    // End PUBLIC method /initModule/
    // ---------------- END PUBLIC METHODS ----------------------

    // 显式地导出公开方法，以映射（map）的形式返回。目前可用的只有 initModule。
    return { initModule: initModule };
}());
