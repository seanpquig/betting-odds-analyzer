package controllers

import anorm._
import anorm.SqlParser._
import play.api.db.DB
import play.api.mvc._
import play.api.Play.current
import play.api.libs.json._
import play.api.routing.JavaScriptReverseRouter

class Application extends Controller {

  def index = Action {
    val fightStrings = getFights0.map {
      case (a1: String, a2: String) => s"$a1 vs. $a2"
    }
    Ok(views.html.index(fightStrings))
  }

  def getOrganizations = Action {
    DB.withConnection { implicit c =>
      val parser = int("id") ~ str("name") ~ str("description") map flatten
      SQL("SELECT * FROM organizations").as(parser.*)
      val sqlResult = SQL("SELECT * FROM organizations").as(parser.*)
      val jsonObjects = sqlResult.map { org =>
        Json.obj(
          "id" -> org._1,
          "name" -> org._2,
          "description" -> org._3
        )
      }
      Ok(Json.toJson(jsonObjects))
    }
  }

  def getEvents(orgId: Int) = Action {
    DB.withConnection { implicit c =>
      val parser = int("id") ~ str("name") ~ str("event_date") ~ str("location") ~ int("org_id") map flatten
      val sqlResult = SQL(s"SELECT * FROM events WHERE org_id=$orgId").as(parser.*)
      val jsonObjects = sqlResult.map { org =>
        Json.obj(
          "id" -> org._1,
          "name" -> org._2,
          "event_date" -> org._3,
          "location" -> org._4,
          "org_id" -> org._5
        )
      }
      Ok(Json.toJson(jsonObjects))
    }
  }

  def getFights(eventId: Int) = Action {
    DB.withConnection { implicit c =>
      val parser =
        int("id") ~
        int("event_id") ~
        int("athlete1_id") ~
        int("athlete2_id") ~
        str("athlete1_result") ~
        str("athlete2_result") ~
        int("end_round") ~
        date("end_round_time") ~
        str("method") ~
        str("referee") map flatten
      val sqlResult = SQL(s"SELECT * FROM fights WHERE event_id=$eventId").as(parser.*)
      val jsonObjects = sqlResult.map { org =>
        Json.obj(
          "id" -> org._1,
          "event_id" -> org._2,
          "athlete1_id" -> org._3,
          "athlete2_id" -> org._4,
          "athlete1_result" -> org._5,
          "athlete2_result" -> org._6,
          "end_round" -> org._7,
          "end_round_time" -> org._8,
          "method" -> org._9,
          "referee" -> org._10
        )
      }
      Ok(Json.toJson(jsonObjects))
    }
  }

  def getAthlete(id: Int) = Action {
    DB.withConnection { implicit c =>
      val parser = int("id") ~ str("name") ~ str("description") map flatten

      Ok(Json.obj())
    }
  }

  def javascriptRoutes = Action { implicit request =>
    Ok(
      JavaScriptReverseRouter("jsRoutes")()
    ).as("text/javascript")
  }

  def getFights0 = {
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
