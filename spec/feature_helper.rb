require 'spec_helper'
require 'capybara'
require "capybara/rspec"
require "capybara/poltergeist"
require 'okay/test/sinatra/application'

Capybara.default_driver = :poltergeist
Capybara.app = Okay::Test::Sinatra::Application

RSpec.configure do |config|
  config.include Capybara::DSL
end

def emit(state)
  evaluate_script('Okay.emit(%s, Okay.watchers)' % state.to_json)
end

def set_adapter
  evaluate_script('Okay.jQuery.use();') if adapter == :jquery
end

def each_adapter(&block)
  [ :no, :jquery ].each do |adapter|
    context "with #{adapter} adapter" do
      let(:adapter) { adapter }
      instance_eval(&block)
    end
  end
end
