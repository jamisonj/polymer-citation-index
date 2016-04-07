var SciUtilities = (function () {
    return {
        toggleCollapse: function (event, collapseId, iconId) {
            var volumeId = event.target.dataArgs;
            var collapse;
            var icon;
            var position;

            if (volumeId === undefined) {
                volumeId = event.target.parentElement.dataArgs;
            }

            collapse = document.querySelector('#' + collapseId + volumeId);
            icon = document.querySelector('#' + iconId + volumeId);

            if (collapse.opened) {
                icon.className += ' rotated';
            } else {
                position = icon.className.indexOf(' rotated');

                if (position >= 0) {
                    icon.className = icon.className.substring(0, position) + icon.className.substring(position + 8);
                }
            }

            collapse.toggle();
        }
    };
})();

var getScripture = function (parameters) {
    var getBook = function (volumes, bookAbbr) {
        var i;
        var j;

        for (i = 0; i < volumes.length; i++) {
            volume = volumes[i];

            for (j = 0; j < volume.books.length; j++) {
                book = volume.books[j];

                if (book.abbr === bookAbbr) {
                    return book;
                }
            }
        }

        return '';
    };
    var drawerPages = document.querySelector('sci-drawer-pages');
    var volume;
    var book;
    var chapter;
    var match = /^[?]book=(.*)&chap=(.*)&(verses=.*)&jst=(.*)$/.exec(parameters);
    var url = '../model/scripture/';
    var sciMainContent = document.querySelector('sci-main-content');
    var sciApp = document.querySelector('sci-app');

    book = getBook(drawerPages.volumes, match[1]);
    chapter = match[2];

    sciMainContent.set('uiState.contentUrl', url + (match[4].length > 0 ? 'jst/' : '') + book.id + '.' + chapter + '.json?' + match[3]);
    sciMainContent.set('book', book);
    sciApp.set('uiState.selectedMainTab', 1);
}