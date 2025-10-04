# Delay Management Application

A system for managing passenger delay notifications currently presents a complex challenge,
particularly due to the multitude of interconnected elements that determine when and how
messages are published. In public transport, such as rail and bus services, there is a lack of integrated information exchange, which makes communication ineffective and often fails to
meet the real-time needs of passengers.

Our proposal is to create a community-driven system where users can share information about
delays and disruptions. These data will be supplemented in real time by the system itself and distributed to other users to help them better organize their journeys.

## Key functionalities of the transport delay application:
1. User-reported disruptions – passengers can report issues they encounter, and for helpful submissions they receive points or other rewards. It is also important to implement a mechanism for verifying reports.
2. Prediction of future disruptions – based on historical data and current information, the system analyzes and forecasts possible delays.
3. Real-time delay information – the application delivers up-to-date delay details, taking into account the timetable and the user’s location.
4. Dispatcher systems – proposal of an interface (API) that allows seamless communication with the dispatching systems of rail and bus operators.
5. Maps and navigation – an interactive map displays current disruptions along routes, enabling users to plan optimal connections.


## User Stories ##

### 1. User Reported Disruptions ###

User Story:
As a Passenger,
I want to report issues when I encounter them
So I can contribute to a better public transportation system (and get points/rewards!)

Requirements:
* Passenger can report traffic issue
* Open question: what inputs are they reporting?
	+ Current Location / Node 0 / GPS
	+ Bus/Tram/Train Line
	+ Type of issue
		- Traffic accident
		- Delay
		- More…
	+ Photo upload
	+ Points System
		- System marks some submission as helpful
		- Passenger receives points/rewards
		- When a user submits, for every submission [by other users] of same issue in same location they get rewarded one point until issue resolved
		- When passenger submits an issue, system will notify other users who share the route
	+ Mechanism for verifying reports
		- Automatic system: what's checking and determining if
		- Manual system: do we have a team checking submissions that come in?

