/**
 * One Small Ask — RUN THIS ONE.
 *
 * This file has exactly two functions and NO setUp, so there is no way to
 * accidentally create a second set of forms.
 *
 *   1. script.google.com  ->  open your "One Small Ask forms" project
 *   2. Select EVERYTHING in the editor and delete it
 *   3. Paste this whole file in
 *   4. In the function dropdown pick  enableVideoUpload  ->  press Run
 *   5. Read the log. It tells you the 3 clicks to add the upload box.
 *
 * onAskSubmit must stay in this file — your form's trigger calls it by name,
 * and deleting it would stop your review emails.
 */

var YOUR_EMAIL   = 'rohinkethipally44@gmail.com';
var ASK_FORM_ID_ = '1u53GzYvqkCuftoW8jFXtYhKERItZuUa60s330PrWeEc';

function enableVideoUpload() {
  var form = FormApp.openById(ASK_FORM_ID_);

  form.setDescription(
    'One specific thing you need, between $5 and $100. Someone who wants to help sends it straight to you — ' +
    'this site never touches the money.\n\n' +
    'THREE THINGS TO KNOW BEFORE YOU START\n\n' +
    '1. You have to be 18 or older. No exceptions.\n\n' +
    '2. You have to record a ten-second video of yourself saying what the money is for. ' +
    'Filmed on your phone, one take, no editing. You will upload it in this form. ' +
    'There is no way around this one — it is the check that makes the whole site work, ' +
    'and it is what lets a stranger trust that you are real.\n\n' +
    '3. Because of the video upload, Google will ask you to sign in with a Google account. ' +
    'Any free Gmail account works. We are not shown your Google account and we do not record it. ' +
    'If you do not have one and cannot make one, email ' + YOUR_EMAIL + ' and we will find another way.\n\n' +
    'WHAT PROTECTS YOU\n\n' +
    '• Nothing is published until a person has read it. Submitting is not posting.\n' +
    '• First names only. Never your full legal name, never your address, never where you are staying.\n' +
    '• Your video is used for review. It is only shown publicly if you tick the box saying you want it to be.\n' +
    '• Nobody ever has to pay a fee to receive a gift. If someone asks, it is a scam.\n' +
    '• If a donor says they overpaid and wants some back, do not send it. That is a scam aimed at you.\n' +
    '• Never share a bank login, card number, security code, or Social Security number.\n' +
    '• Your request comes down the same day you ask, no questions.\n\n' +
    'If you need shelter, food or help TODAY, call 2-1-1. This site is slow and cannot act now.'
  );

  var items = form.getItems();
  var deleted = 0;

  for (var i = items.length - 1; i >= 0; i--) {
    var t = items[i].getTitle();

    // The email-a-video question is obsolete once the upload box exists.
    if (t.indexOf('Have you sent the video') !== -1) {
      form.deleteItem(items[i]);
      deleted++;
      continue;
    }

    if (t === 'The video') {
      items[i].asSectionHeaderItem().setHelpText(
        'Record ten seconds of yourself saying who you are and what the money is for. ' +
        'Filmed on your phone, one take, no editing — it does not need to be neat, it needs to be you.\n\n' +
        'Upload it below. Nothing gets published without it.'
      );
    }

    if (t.indexOf('Are you 18 or older') !== -1) {
      items[i].asMultipleChoiceItem().setHelpText(
        'We ask everyone, and we cannot make an exception. A public post asking strangers for money ' +
        'is not a safe thing for someone under 18 to have.'
      );
    }

    if (t.indexOf('May we publish your video') !== -1) {
      items[i].asMultipleChoiceItem().setHelpText(
        'You do not have to say yes, and saying no does not affect whether your request is published. ' +
        'The video is watched during review either way. Most people say no, and that is completely fine.'
      );
    }
  }

  var log = [
    '',
    'Form updated. Deleted ' + deleted + ' obsolete question(s).',
    '',
    '=========================================================',
    '  NOW ADD THE UPLOAD BOX BY HAND — 3 STEPS',
    '=========================================================',
    '',
    'Open: ' + form.getEditUrl(),
    '',
    '1. Scroll to the section headed "The video".',
    '   Click the + button (add question) directly underneath it.',
    '',
    '2. Set the question title to:   Your ten-second video',
    '   Then open the question-type dropdown (it says "Multiple choice")',
    '   and choose  File upload.  Click Continue when it warns you that',
    '   respondents will have to sign in — that is expected.',
    '',
    '3. In that question, set:',
    '        Allow only specific file types  ->  ON  ->  tick  Video',
    '        Maximum number of files         ->  1',
    '        Maximum file size               ->  100 MB',
    '        Required                        ->  ON  (bottom right toggle)',
    '',
    '=========================================================',
    '  THEN CHECK IT',
    '=========================================================',
    '',
    'Open the live form and submit a real test with an actual video:',
    '  ' + form.getPublishedUrl(),
    '',
    'You should get: the review email, AND the video in your Drive',
    'under a folder named after the form. The response row links to it.',
    '',
    'Storage: a 10-second phone video is roughly 5-20 MB, so a free',
    '15 GB Drive holds on the order of a thousand of them. Not a concern',
    'for a long time, but it is your Drive filling up, not Google\'s.',
    ''
  ].join('\n');

  Logger.log(log);
  MailApp.sendEmail({
    to: YOUR_EMAIL,
    subject: 'One Small Ask — finish the video upload (3 steps)',
    body: log
  });
}

function onAskSubmit(e) {
  var answers = {};
  var items = e.response.getItemResponses();
  for (var i = 0; i < items.length; i++) {
    answers[items[i].getItem().getTitle()] = items[i].getResponse();
  }

  var get = function (needle) {
    for (var k in answers) {
      if (k.toLowerCase().indexOf(needle.toLowerCase()) !== -1) {
        return String(answers[k] || '');
      }
    }
    return '';
  };

  var name    = get('First name');
  var area    = get('city or area');
  var title   = get('In one line');
  var amount  = parseFloat(String(get('Exactly how much')).replace(/[^0-9.]/g, '')) || 0;
  var story   = get('What is going on');
  var forWhat = get('What exactly will the money buy');
  var check   = get('one thing we can check');
  var method  = get('How should someone send');
  var handle  = get('Your handle');
  var reach   = get('reach you at');
  // The uploaded video. Keyed on item TYPE, not title, so renaming the
  // question in the editor cannot silently break this.
  var video = 'NO VIDEO ATTACHED — do not publish until you have one';
  try {
    for (var v = 0; v < items.length; v++) {
      if (items[v].getItem().getType() === FormApp.ItemType.FILE_UPLOAD) {
        var ids = items[v].getResponse();
        if (ids && ids.length) {
          video = 'https://drive.google.com/file/d/' + ids[0] + '/view';
        }
      }
    }
  } catch (err) {
    video = 'could not read the upload (' + err + ') — check the response in the form';
  }
  var pub     = get('May we publish');

  var methodKey = method.indexOf('Cash') === 0 ? 'cashapp'
                : method.indexOf('PayPal') === 0 ? 'paypal'
                : method.indexOf('Venmo') === 0 ? 'venmo' : 'cashapp';

  var slug = (name + '-' + title).toLowerCase().replace(/[^a-z0-9]+/g, '-')
               .replace(/^-|-$/g, '').split('-').slice(0, 3).join('-');
  var d = new Date();
  var mmdd = ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2);

  var json = {
    id: slug + '-' + mmdd,
    name: name,
    area: area,
    category: 'work',
    amountUsd: amount,
    title: title,
    story: story,
    forWhat: forWhat,
    contactMethod: methodKey,
    contactHandle: handle,
    videoUrl: '',
    reviewNote: '',
    confirmedAdult: false,
    videoWatched: false,
    photoReverseSearched: false,
    detailCorroborated: false,
    duplicateScreened: false
  };

  var body =
    'NEW REQUEST — not published, nothing is live until you publish it.\n' +
    '===========================================================\n\n' +
    'BEFORE YOU PUBLISH, ALL FOUR:\n' +
    '  1. Watch the whole video. Real person, matches the story, not a minor, nobody coaching off-camera.\n' +
    '  2. Reverse-image search any photo (and a video frame if anything feels off).\n' +
    '  3. Corroborate this detail:  ' + check + '\n' +
    '  4. Screen against everything submitted before — handle, name, area, story.\n\n' +
    'WATCH THE VIDEO:  ' + video + '\n' +
    'Publish the video? ' + pub + '\n' +
    'Reach them at: ' + reach + '   (never publish this)\n\n' +
    '-----------------------------------------------------------\n' +
    'WHAT THEY WROTE\n\n' +
    'Name shown:  ' + name + '\n' +
    'Area:        ' + area + '\n' +
    'Amount:      $' + amount + '\n' +
    'Headline:    ' + title + '\n' +
    'For:         ' + forWhat + '\n\n' +
    'Story:\n' + story + '\n\n' +
    'Pays via:    ' + method + '  ->  ' + handle + '\n\n' +
    '-----------------------------------------------------------\n' +
    'TO PUBLISH: save the block below as new-request.json in your repo,\n' +
    'set the five check flags to true once you have actually done them,\n' +
    'fix the category if it is wrong, then:\n\n' +
    '    node scripts/publish.mjs new-request.json\n' +
    '    npm run build && git commit -am "Publish request: ' + json.id + '" && git push\n\n' +
    'category must be one of: food transport medical housing work school family other\n\n' +
    JSON.stringify(json, null, 2) + '\n\n' +
    '-----------------------------------------------------------\n' +
    'If anything about this makes you hesitate, do not publish it. A request you\n' +
    'were unsure about is the one that costs you the whole project.\n';

  MailApp.sendEmail({
    to: YOUR_EMAIL,
    subject: 'One Small Ask — new request from ' + (name || 'someone') + ' ($' + amount + ')',
    body: body
  });
}
