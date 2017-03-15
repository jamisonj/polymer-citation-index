var SciHashManager = (function () {
    /*
     * UI state parameters object looks like this:
     *
     * {
     *  citation: { bookId, chapter },
     *  content: { selectedCategory, selectedId },
     *  filter: { corpus, endYear, groupBy, sortBy, speakerId, startYear },
     *  scripture: { bookId, chapter, isJst, verses },
     *  selectedDrawerTab,
     *  selectedMainTab,
     *  speaker: { letter, speakerId },
     *  talk: { talkId, highlight, targetCitationId }
     * }
     */
    'use strict';

    var decodeCitation = function (parameters, hash) {
        if (hash.length >= 3) {
            parameters.citation = { bookId: parseInt(hash.substring(0, 3), 16) };

            if (hash.length >= 5) {
                parameters.citation.chapter = parseInt(hash.substring(3, 5), 16);
            }

            if (hash.length > 5) {
                decodeCitationFilter(parameters, hash.substring(5));
            }
        } else {
            parameters.citation = undefined;
        }
    };

    var decodeCitationFilter = function (parameters, hash) {
        var extract;

        if (hash.length >= 13) {
            parameters.filter = {};
            extract = hash.substring(1, 5);

            if (extract === 'NYNY') {
                parameters.filter.speakerId = 'Any';
            } else {
                parameters.filter.speakerId = parseInt(extract, 16);
            }

            parameters.filter.startYear = parseInt(hash.substring(5, 8), 16);
            parameters.filter.endYear = parseInt(hash.substring(8, 11), 16);

            switch (hash.substring(11, 12)) {
                case '1':
                    parameters.filter.corpus = 'G';
                    break;
                case '2':
                    parameters.filter.corpus = 'E';
                    break;
                case '3':
                    parameters.filter.corpus = 'J';
                    break;
                case '4':
                    parameters.filter.corpus = 'T';
                    break;
            }

            extract = parseInt(hash.substring(12), 16);

            parameters.filter.sortBy = (extract % 2 === 0) ? 'f' : 's';
            parameters.filter.groupBy = (Math.floor(extract / 2) === 0) ? 'i' : 'f';
        } else {
            parameters.filter = undefined;
        }
    };

    var decodeContentTab = function (parameters, hash) {
        parameters.content = { selectedCategory: parseInt(hash.substring(0, 1), 16) };

        if (hash.length > 1) {
            parameters.content.selectedId = parseInt(hash.substring(1), 16);
        }
    };

    var decodeMainContent = function (parameters, hash) {
        var components;

        if (hash !== undefined && hash.length > 0) {
            components = /([^0-9a-fA-F]*)([$]([0-9a-fA-F]*))?(&(.*))?/.match(hash);

            parameters.talk = { talkId: parseInt(components[1], 16) };

            if (components[3].length > 0) {
                parameters.talk.targetCitationId = parseInt(components[3], 16);
            }

            if (components[5].length > 0) {
                parameters.talk.highlight = components[5];
            }
        } else {
            parameters.talk = undefined;
        }
    };

    var decodeScripture = function (parameters, hash) {
        var bookId;
        var isJst = false;
        var verses = '';

        if (hash !== undefined && hash.length >= 3) {
            bookId = parseInt(hash.substring(0, 3), 16);

            if (bookId >= 1024) {
                bookId -= 1024;
                isJst = true;
            }

            parameters.scripture = { bookId: bookId, isJst: isJst };

            if (hash.length >= 5) {
                parameters.scripture.chapter = parseInt(hash.substring(3, 5), 16);

                if (hash.length > 5) {
                    hash.substring(5).split('').forEach(function (index, digit) {
                        var code = digit.charCodeAt(0);

                        if (code >= 97) {
                            verses += '-';
                            code -= 49;
                        } else if (code >= 65) {
                            verses += ',';
                            code -= 17;
                        }

                        verses += String.fromCharCode(code);
                    });

                    parameters.scripture.verses = verses;
                }
            }
        } else {
            parameters.scripture = undefined;
        }
    };

    var decodeSelections = function (parameters, hash) {
        var code = hash.charCodeAt(0) - 65;

        parameters.selectedDrawerTab = Math.floor(code / 4);
        parameters.selectedMainTab = code % 4;
    };

    var decodeSpeaker = function (parameters, hash) {
        if (hash !== undefined && hash.length > 0) {
            if (hash.substring(0, 1) === 's') {
                parameters.speaker = { letter: hash.substring(1, 2) };
            } else {
                parameters.speaker = { speakerId: parseInt(hash, 16) };
            }
        } else {
            parameters.speaker = undefined;
        }
    };

    var encodeCitationFilterHash = function (filter) {
        var hash = '';
        var groupSort = 0;

        if (filter !== undefined) {
            hash = '$';

            if (filter.speakerId === 'Any') {
                hash += 'NYNY';
            } else {
                hash += padIntToHex(filter.speakerId, 4);
            }

            hash += padIntToHex(filter.startYear, 3) + padIntToHex(filter.endYear, 3);

            switch (filter.corpus) {
                case 'G':
                    hash += '1';
                    break;
                case 'E':
                    hash += '2';
                    break;
                case 'J':
                    hash += '3';
                    break;
                case 'T':
                    hash += '4';
                    break;
                default:
                    hash += '0';
                    break;
            }

            if (filter.sortBy === 's') {
                groupSort += 1;
            }

            if (filter.groupBy === 'f') {
                groupSort += 2;
            }

            hash += intToHex(groupSort);
        }

        return hash;
    };

    var encodeCitationHash = function (parameters) {
        var hash = '';

        if (parameters.citation.bookId !== undefined) {
            hash = padIntToHex(parameters.citation.bookId, 3);

            if (parameters.citation.chapter !== undefined) {
                hash += padIntToHex(parameters.citation.chapter, 2);
            }
        }

        return hash + encodeCitationFilterHash(parameters.filter);
    };

    var encodeContentTabHash = function (content) {
        var hash = intToHex(content.selectedCategory);

        if (content.selectedId !== undefined) {
            hash += intToHex(content.selectedId);
        }

        return hash;
    };

    var encodeMainContentHash = function (talk) {
        var hash = '';

        if (talk !== undefined) {
            hash = intToHex(talk.talkId);

            if (talk.targetCitationId !== undefined) {
                hash += '$' + intToHex(talk.targetCitationId);
            }

            if (talk.highlight !== undefined) {
                hash += '&' + talk.highlight;
            }
        }

        return hash;
    };

    var encodeScriptureHash = function (scripture) {
        var additiveIndex = 0;
        var hash = '';
        var previousDash = false;
        var previousComma = false;

        if (scripture !== undefined && scripture.bookId !== undefined) {
            hash = padIntToHexWithIncrement(scripture.bookId, 3, scripture.isJst ? 1024 : 0);

            if (scripture.chapter !== undefined) {
                hash += padIntToHex(scripture.chapter, 2);

                if (scripture.verses !== undefined) {
                    scripture.verses.split('').forEach(function (index, digit) {
                        if (digit === ',') {
                            previousComma = true;
                        } else if (digit === '-') {
                            previousDash = true;
                        } else {
                            /* digit must be [0-9] */
                            if (previousComma) {
                                additiveIndex = 17;  // 0 represented as A
                                previousComma = false;
                            } else if (previousDash) {
                                additiveIndex = 49;  // 0 represented as a
                                previousDash = false;
                            }

                            hash += String.fromCharCode(digit.charCodeAt(0) + additiveIndex);
                            additiveIndex = 0;
                        }
                    });
                }
            }
        }

        return hash;
    };

    var encodeSelections = function (parameters) {
        return String.fromCharCode(parameters.selectedDrawerTab * 4 +
            parameters.selectedMainTab + 65);
    };

    var encodeSpeakerHash = function (speaker) {
        var hash = '';

        if (speaker !== undefined) {
            if (speaker.letter !== undefined) {
                hash = 's' + speaker.letter;
            } else if (speaker.speakerId !== undefined) {
                hash = intToHex(speaker.speakerId);
            }
        }

        return hash;
    };

    var intToHex = function (value) {
        return padIntToHexWithIncrement(value, 0, 0);
    };

    var navigate = function (event) {
        var sciApp = document.querySelector('sci-app');

        sciApp.navigateUi(SciHashManager.decodeHash(event.newURL.substring(event.newURL.indexOf('#') + 1)));
    };

    var padIntToHex = function (value, padding) {
        return padIntToHexWithIncrement(value, padding, 0);
    };

    var padIntToHexWithIncrement = function (value, padding, increment) {
        var hex = (parseInt(value, 10) + increment).toString(16);

        while (hex.length < padding) {
            hex = '0' + hex;
        }

        return hex;
    };

    window.onhashchange = navigate;

    return {
        /*
         * These are externally visible members.
         */

        decodeHash : function (hash) {
            var parameters = {};
            var hashSegments = hash.split(':');

            if (hashSegments.length === 5) {
                decodeSelections(parameters, hashSegments[0].substring(0, 1));
                decodeScripture(parameters, hashSegments[0].substring(1));
                decodeCitation(parameters, hashSegments[1]);
                decodeContentTab(parameters, hashSegments[2]);
                decodeSpeaker(parameters, hashSegments[3]);
                decodeMainContent(parameters, hashSegments[4]);
            }

            return parameters;
        },

        encodeHash : function (parameters) {
            if (parameters === undefined) {
                return '';
            }

            return encodeSelections(parameters) +
                encodeScriptureHash(parameters.scripture) + ':' +
                encodeCitationHash(parameters) + ':' +
                encodeContentTabHash(parameters.content) + ':' +
                encodeSpeakerHash(parameters.speaker) + ':' +
                encodeMainContentHash(parameters.talk);
        }
    };
})();