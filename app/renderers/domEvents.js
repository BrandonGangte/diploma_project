// clickEvents.js : Diploma Project 2017
// Module containing all the event listeners for handling
// DOM events.
$(document).ready(() => {
    var actions = {
        click: 'click',
        hover: 'hover',
        mouseover: 'mouseover'
    },
    appEventActions = {
        loadArticles: sCategory => {
            if(typeof sCategory !== 'string') {
                throw new Error(name + ': ArgumentError: expected a string');
            }
            console.log(sCategory);
            exposed
                .customNetRequest
                    .fetchArticlesFromCategory(sCategory, oData => {
                        oData.articles.forEach((oArticle)=> {
                            exposed.domActions.createArticleDOM(oArticle, (domElem) => {
                                exposed.domActions.appendNewArticle(domElem)
                            });
                        });
                    });
        },
        showPopOver: target => {
            appEventActions.removePopOver();
            $(target).popover({
                animation: true,
                container: $(target).parent(),
                placement: 'right',
                content: '<div class="popover-item">' +
                '<img src="../assets/images/loading_spinner.gif"'+
                'class="media-object" alt="Sample Image"' +
                'width="40" height="40"></div>',
                html: true
            }).popover('show');
            $(target).attr('id', 'currentReadItLater');
        },
        removePopOver: () => {
            $('#currentReadItLater')
                .popover('hide').popover('destroy');
            $('#currentReadItLater').removeAttr('id');
        },
        saveArticles: target => {
            let parent = $(target).parents('li').first(),
                article = '<li class="col-3">' + parent.html() + '</li>',
                title = parent.find('h2').first().html();
            appDataFromFs.getContents('read-it-later.json', (err, oSavedArticles) => {
                oSavedArticles = oSavedArticles || {};
                if ( oSavedArticles && title in oSavedArticles) {
                    $(target).removeClass('readlater');
                    $(target).addClass('added-to-read-later');
                    appEventActions.removePopOver();
                    return;
                }
                oSavedArticles[title] = article;
                appDataFromFs.setContents('read-it-later.json',
                    oSavedArticles, err => {
                        let popOverElem = $('.popover-item');
                        popOverElem.children().remove();
                        if (err) {
                            popOverElem.append('<span>Something went wrong!</span>');
                        } else {
                            popOverElem.append('<span style="font-size:14px; color:black !important;">Added to read it later!</span>');
                            $(target).removeClass('readlater');
                            $(target).addClass('added-to-read-later');
                        }
                        window.setTimeout(appEventActions.removePopOver, 2000);
                    });
            });

        },
        loadSavedArticles: () => {
            appDataFromFs.getContents('read-it-later.json',
            (err, oSavedArticles) => {
                if (err || !oSavedArticles) {
                    $('#readItLater').popover({
                        animation: true,
                        container: $(this),
                        placement: 'right',
                        content: '<div class="popover-saveArticle">' +
                        '<span>No saved articles!</span>' +
                        '</div>',
                        html: true
                    }).popover('show');
                    window.setTimeout(() => {
                        $('#readItLater').popover('hide')
                                         .popover('destroy');
                    }, 2000);
                } else {
                    $('#savedNewsList > li').remove();
                    appEventActions.changeScreenContents('readLater');
                    AppData.savedArticle = oSavedArticles;
                    Object.keys(oSavedArticles).forEach((sTitle) => {
                        let domActions = exposed.domActions;
                        domActions
                        .appendNewArticle(domActions.buildDomElem(oSavedArticles[sTitle]), '#savedNewsList');
                    });
                }
            });
        },

        // Change the contents being displayed on screen..
        // sContentType: news, readLater, settings
        changeScreenContents: sContentType => {
            switch (sContentType) {
                case 'news':
                    $('#settingsHeader').attr('style', 'display: none;');
                    $('#settingsBody').attr('style', 'display: none;');
                    $('#readItLaterHeader').attr('style', 'display: none;');
                    $('#savedNewsList').attr('style', 'display: none;');
                    $('#newsCategoryHeader').attr('style', 'display: block;');
                    $('#newsList').attr('style', 'display: block;');
                    break;
                case 'readLater':
                    $('#settingsHeader').attr('style', 'display: none;');
                    $('#settingsBody').attr('style', 'display: none;');
                    $('#newsCategoryHeader').attr('style', 'display: none;');
                    $('#newsList').attr('style', 'display: none;');
                    $('#readItLaterHeader').attr('style', 'display: block;');
                    $('#savedNewsList').attr('style', 'display: block;');
                    break;
                case 'settings':
                    $('#newsCategoryHeader').attr('style', 'display: none;');
                    $('#newsList').attr('style', 'display: none;');
                    $('#readItLaterHeader').attr('style', 'display: none;');
                    $('#savedNewsList').attr('style', 'display: none;');
                    $('#settingsHeader').attr('style', 'display: block;');
                    $('#settingsBody').attr('style', 'display: block;');
                    break;
                default:
                    // Nothing here...
            }
        },

        // Redisplay the news contents after read it later and
        // settings button are pressed.
        reloadCurrentCategory: () => {
            appEventActions.changeScreenContents('news');
            $('#savedNewsList').empty();
            $('#clickedReadItLater').attr('id', 'readItLater');
        },

        // Set the color of the element clicked.
        setBgColor: target => {
            $('#clickedSideBarBtn').attr('id',
                $('#clickedSideBarBtn').attr('elemName'));
            if (!target) {
                return;
            }
            $(target).attr('elemName', $(target).attr('id'));
            $(target).attr('id', 'clickedSideBarBtn');
        },

        changeTheme: (sFrom, sTo) => {
            appEventActions
                .toggleSelected('#themeOpt > [value='+sFrom+']',
                                '#themeOpt > [value='+sTo+']');
            let defaultModeMain = $('.'+sFrom);
            let defaultModeLight = $('.'+sFrom+'Light');
            let defaultModeDark = $('.'+sFrom+'Dark');
            defaultModeMain.removeClass(sFrom);
            defaultModeLight.removeClass(sFrom+'Light');
            defaultModeDark.removeClass(sFrom+'Dark');
            defaultModeMain.addClass(sTo);
            defaultModeLight.addClass(sTo+'Light');
            defaultModeDark.addClass(sTo+'Dark');
        },
        toggleSelected: (sFrom, sTo) => {
            $(sFrom).attr('selected','false');
            $(sTo).attr('selected','true');
        }
    };

    //... Something to add.

    // Click Events:
    // listen for clicks on Sidebar show-hide tab.
    // when clicked hide or show the side nav.
    $(document).on(actions.click, '#sideBarBtn', () => {
        $('#sidebar').toggleClass('visible');
        $('.grid').toggleClass('Visit');
    });

    // listen for clicks on refresh tab.
    $(document).on(actions.click, '#refreshPage', () => {
        appEventActions.setBgColor();
        appEventActions.reloadCurrentCategory();
        $('#currentCategory').trigger('click');
    });

    // listen for clicks on read it later tab.
    $(document).on(actions.click, '#readItLater', event => {
        event.preventDefault(); event.stopPropagation();
        appEventActions.setBgColor(event.currentTarget);
        // load all the articles saved for read later.
        appEventActions.loadSavedArticles();
    });

    // listen for clicks on sources tab.
    $(document).on(actions.click, '#nightMode', event => {
        event.preventDefault(); event.stopPropagation();
        $('input[type=checkbox]').trigger('click');
    });

    // listen for clicks on settings tab.
    $(document).on(actions.click, '#appSettings', event => {
        event.preventDefault(); event.stopPropagation();
        appEventActions.setBgColor(event.currentTarget);
        appEventActions.changeScreenContents('settings');
    });

    // listen for click on addToReadLater button.
    $(document).on(actions.click, '.readlater', event => {
        event.preventDefault(); event.stopPropagation();
        AppData.savedArticle = $(event.currentTarget).parents('li').first();
        appEventActions.showPopOver(event.currentTarget);
        appEventActions.saveArticles(event.currentTarget);
    });

    $(document).on(actions.click, '.goBackBtn', event => {
        event.preventDefault(); event.stopPropagation();
        appEventActions.setBgColor();
        appEventActions.reloadCurrentCategory();
    });

    $(document).on(actions.click, '#noConnectionBtn', event => {
        event.stopPropagation(); event.preventDefault();
        $('#currentCategory').trigger('click');
    });

    $(document).on(actions.click, '.newsCategory', event => {
        let category = $(event.currentTarget).attr('category');
        let style = $('#currentCategory').attr('style');
        appEventActions.setBgColor();
        // When pressed change the current category
        $('#currentCategory').removeAttr('style');
        $('#currentCategory').addClass('newsCategory');
        $('#currentCategory').removeAttr('id');
        // to the one that is clicked on.
        $(event.currentTarget).attr('id', 'currentCategory');
        $(event.currentTarget).attr('style', style);
        //$(event.currentTarget).removeClass('newsCategory');
        appEventActions.loadArticles(category);
    });

    $(document).on( 'click', "input[type=checkbox]", event => {
        event.stopPropagation();
        if (event.currentTarget.id === 'colorMode') {
            if(document.getElementById('colorMode').checked === true) {
                console.log('this');
                document.getElementById('colorMode').checked = true;
                let mode = AppData.colorMode.night;
                let normal = $('.' + AppData.colorMode.normal);
                normal.removeClass(AppData.colorMode.normal);
                normal.addClass(mode);
                $(event.currentTarget).val(null);
                AppData.appSettings.currentColorMode = mode;
            } else {
                console.log('that');
                document.getElementById('colorMode').checked = false;
                let mode = AppData.colorMode.normal;
                let night = $('.'+AppData.colorMode.night);
                night.removeClass(AppData.colorMode.night);
                night.addClass(mode);
                $(event.currentTarget).val('on');
                AppData.appSettings.currentColorMode = mode;
            }

            ipcRenderer.send('app-settings', AppData.appSettings);
        }
    });

    $(document).on('click', '#themeSelect', event => {
        event.preventDefault(); event.stopPropagation();
        console.log('pressed');
        let option = $('#themesOpt').find('option:selected').text();
        if(option === 'Red') {
           appEventActions.changeTheme('blue', 'red');
        } else {
            appEventActions.changeTheme('red', 'blue');
        }
        AppData.appSettings.currentAppTheme = option.toLowerCase();
        ipcRenderer.send('app-settings', AppData.appSettings);
    });

    $(document).on('click', '#sortSelect', event=>{
        event.stopPropagation();
        let selected = $('#sortOpt > option:selected').attr('value');
        AppData.appSettings.sortOrder = selected;
        ipcRenderer.send('app-settings', AppData.appSettings);
    });
    if(remote.app.isReady()) {
        let appSettings = appDataFromFs.readFromFile('settings.json');
        if (appSettings){
            AppData.appSettings = appSettings;
        }
        ipcRenderer.send('app-settings', AppData.appSettings);
        if (AppData.appSettings.currentColorMode === 'night'){
            document.getElementById('colorMode').checked = true;
            let defaultMode = $('.normal');
            defaultMode.removeClass('normal');
            defaultMode.addClass(AppData.appSettings.currentColorMode);
        }
        if (AppData.appSettings.currentAppTheme === 'red') {
            appEventActions.changeTheme('blue', 'red');
        }
        
        if (AppData.appSettings.sortOrder === 'latest') {
            appEventActions
                .toggleSelected('#sortOpt > [value=top]',
                                '#sortOpt > [value=latest]');
        }
    }
});