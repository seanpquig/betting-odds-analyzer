package controllers

import com.google.inject.Inject
import play.api.mvc._
import play.api.routing.JavaScriptReverseRouter


class Application @Inject() (cc: ControllerComponents) extends AbstractController(cc) {

  def index = Action {
    Ok(views.html.index())
  }

  def react = Action {
    Ok(views.html.react())
  }

  def javascriptRoutes = Action { implicit request =>
    Ok(
      JavaScriptReverseRouter("jsRoutes")(
        routes.javascript.StatsDatabase.getOrganizations,
        routes.javascript.StatsDatabase.getEvents,
        routes.javascript.StatsDatabase.getFights,
        routes.javascript.StatsDatabase.getAthlete,
        routes.javascript.StatsDatabase.getAthleteNames,
        routes.javascript.StatsDatabase.getOdds
      )
    ).as("text/javascript")
  }

}
