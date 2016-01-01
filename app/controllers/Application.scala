package controllers

import anorm._
import anorm.SqlParser._
import play.api.db.DB
import play.api.mvc._
import play.api.Play.current
import play.api.routing.JavaScriptReverseRouter


class Application extends Controller {

  def index = Action {
    val fightStrings = getFights.map {
      case (a1: String, a2: String) => s"$a1 vs. $a2"
    }
    Ok(views.html.index(fightStrings))
  }

  def javascriptRoutes = Action { implicit request =>
    Ok(
      JavaScriptReverseRouter("jsRoutes")(
        routes.javascript.StatsDatabase.getOrganizations,
        routes.javascript.StatsDatabase.getEvents,
        routes.javascript.StatsDatabase.getFights,
        routes.javascript.StatsDatabase.getAthlete
      )
    ).as("text/javascript")
  }

  def getFights = {
    DB.withConnection { implicit c =>
      val parser = str(1) ~ str(2) map flatten
      SQL(
        """
          SELECT
            a1.fullname athlete1,
            a2.fullname athlete2
          FROM fights
          INNER JOIN athletes a1 ON fights.athlete1_id = a1.id
          INNER JOIN athletes a2 ON fights.athlete2_id = a2.id
        """
      ).as(parser.*)

    }
  }

}
