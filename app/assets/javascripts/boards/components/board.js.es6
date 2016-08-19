//= require ./board_blank_state
//= require ./board_delete
//= require ./board_list

(() => {
  const Store = gl.issueBoards.BoardsStore;

  window.gl = window.gl || {};
  window.gl.issueBoards = window.gl.issueBoards || {};

  gl.issueBoards.Board = Vue.extend({
    components: {
      'board-list': gl.issueBoards.BoardList,
      'board-delete': gl.issueBoards.BoardDelete,
      'board-blank-state': gl.issueBoards.BoardBlankState
    },
    props: {
      list: Object,
      disabled: Boolean,
      issueLinkBase: String
    },
    data () {
      return {
        query: '',
        filters: Store.state.filters
      };
    },
    watch: {
      query () {
        this.list.filters = this.getFilterData();
        this.list.getIssues(true);
      },
      filters: {
        handler () {
          this.list.page = 1;
          this.list.getIssues(true);
        },
        deep: true
      }
    },
    methods: {
      getFilterData () {
        const filters = this.filters;
        let queryData = { search: this.query };

        Object.keys(filters).forEach((key) => { queryData[key] = filters[key]; });

        return queryData;
      }
    },
    ready () {
      const options = gl.issueBoards.getBoardSortableDefaultOptions({
        disabled: this.disabled,
        group: 'boards',
        draggable: '.is-draggable',
        handle: '.js-board-handle',
        onEnd: (e) => {
          document.body.classList.remove('is-dragging');

          if (e.newIndex !== undefined && e.oldIndex !== e.newIndex) {
            const order = this.sortable.toArray(),
                  $board = this.$parent.$refs.board[e.oldIndex + 1],
                  list = $board.list;

            $board.$destroy(true);

            this.$nextTick(() => {
              Store.state.lists.splice(e.newIndex, 0, list);
              Store.moveList(list, order);
            });
          }
        }
      });

      if (bp.getBreakpointSize() === 'xs') {
        options.handle = '.js-board-drag-handle';
      }

      this.sortable = Sortable.create(this.$el.parentNode, options);
    },
    beforeDestroy () {
      Store.state.lists.$remove(this.list);
    }
  });
})();
