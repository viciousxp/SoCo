Initial commit of SoCo (Social Communities)

SoCo aims to be a fully featured social media module able to manage users, feeds, activity feeds, follow/unfollow, tagging, and full featured search. 

SoCo will eventually have additional modules to handle new functionalities, I am aiming to add support for events and calendars and images and galleries initially.

The SoCo API will aim to standardize parameters and callbacks. I am to follow the following pattern:
Object.function(config, callback(err, data)).

SoCo uses neo4j as its primary database, and Redis to store sessions.

Follow me for updates, and contact me for suggestions, requests or contributions!