> [!IMPORTANT]
> Considering YouTube is constantly changing its DOM structure, CSS classes, and the fact that there's no API solution, this add-on will probably never see the light of the day.

> [!NOTE]
> **Update Sep 1st, 2025:** I've been made aware of YouTube's internal API, Innertube, that can reliably fetch Profile Card data and has no quota! The problem is that it's undocumented (internal API duh) so I have no idea how to use it. `POST: https://www.youtube.com/youtubei/v1/account/get_profile_card` If anyone can reverse engineer this API, please make an issue!

## What is this [add-on](https://addons.mozilla.org/firefox/addon/wip-yt-profile-card-info)?
This is a browser extension designed to make [Profile Cards](https://support.google.com/youtube/answer/9409333) useful by extracting data from it and displaying that data below YouTube comments' handles as info boxes.

## What does this add-on do?
It works by programmatically clicking on the commenter's profile picture to trigger YouTube's Profile Card pop-up. The add-on then extracts specific data points from this pop-up, closes it automatically, and displays the extracted information as info boxes beneath the commenter's handle.

The extracted information are three data types:
- `total comments` the commenter has posted in all videos of a content creator's YouTube channel
- number of `hearts received` from said content creator
- any special `badges` associated with the commenter

## What is the technical implementation of this add-on?
It uses a sophisticated queuing system to sequentially manage profile data extraction, *preventing multiple simultaneous pop-up interactions* that could interfere with each other. Comments are processed one at a time with delays between operations to make sure *information is properly extracted*. Handle verification is included to ensure the extracted profile information matches the intended commenter, *preventing misattribution in cases where pop-up timing issues might occur*.

It also employs mutation observers to detect both existing comments on page load and new comments that appear during scrolling or dynamic loading (sort to Newest, clicking on Replies). This ensures *comprehensive coverage regardless of how user navigate the comment section*.

## What are the known limitations of this add-on?
It faces several inherent constraints due to its operational approach:
- **Since it depends on YouTube's Profile Card interface, any changes to YouTube's DOM structure or CSS classes could break the data extraction functionality.**
- The more comments a YouTube video/short/community post has, the more it has to process, and it might miss one or two comments.
- Since YouTube comment section loads dynamically, user will have to scroll down for more comments to load for the add-on to process more comments. Because of this, it might not include the badge icon for some commenters' info boxes.
- Its operations could interfere with user's interaction, such as while searching in the search box. If user clicks while Profile Card is visible, information might not properly be extracted.
- [Bring back YouTube Comment Usernames](https://addons.mozilla.org/firefox/addon/youtube-找回留言區用戶名稱) will render this add-on useless because of the handle verification step.

## Why can't you do away with programmatically clicking to extract information?
YouTube doesn’t provide a public API for Profile Card, so I have no choice. Sincerely sorry! ╯︿╰

Authorization
	SAPISIDHASH 1756722847_dc7901e66d464158dbaa67ed38abb0bf798d6fc7_u SAPISID1PHASH 1756722847_dc7901e66d464158dbaa67ed38abb0bf798d6fc7_u SAPISID3PHASH 1756722847_dc7901e66d464158dbaa67ed38abb0bf798d6fc7_u`

## What is this add-on's purpose?
A **proof of concept** to demonstrate that helpful information can easily be made accessible at the user's **fingertips**. I've always find Profile Card to be practically useless since user must manually **click** the commenter's profile picture to access it, and barely anyone does that. Hopefully, someone from YouTube sees this and implements API-based solutions or just make Profile Cards more useful. **Until that day comes, this add-on will remain in development.**

## Future development...
| Feature to be implemented | CSS selector(s) |
| --- | --- |
| Pronouns (yt is becoming woke lol) | `yt-profile-identity-info-view-model-wiz__metadata-pronouns` |
| Recent comments on this channel | `ytProfileInfoViewModelActivity`, `ytCommentInteractionViewModelVideoTitle`, `ytCommentInteractionViewModelCommentContent` |
| Subscriptions (some commenters' profile cards show this even though they don't have the Public subscriber badge, wtf yt?!?) | `yt-spec-avatar-shape--avatar-size-medium`, `ytSharedSubscriptionViewModelChannelName` |

![](evidence/1.png)
![](evidence/2.png)
![](evidence/3.png)
![](evidence/4.png)
![](evidence/5.png)
![](evidence/6.png)
